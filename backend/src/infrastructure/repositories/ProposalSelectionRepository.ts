import mongoose, { Types } from "mongoose";
import type {
    IProposalSelectionRepository,
    ProposalSelectionResult,
} from "../../domain/interface/IProposalSelectionRepository.js";
import { ProposalSelectionError } from "../../domain/interface/IProposalSelectionRepository.js";
import { ProposalModel } from "../models/ProposalModel.js";
import { IssueModel } from "../models/IssueModel.js";
import { ProposalStatus } from "../../domain/enums/ProposalStatus.js";
import { IssueStatus } from "../../domain/enums/IssueStatus.js";
import { ProposalWindowStatus } from "../../domain/enums/ProposalWindowStatus.js";

export class ProposalSelectionRepository implements IProposalSelectionRepository {
    async selectProposalAtomic(
        issueId: string,
        proposalId: string,
        serverNow: Date
    ): Promise<ProposalSelectionResult> {
        if (!Types.ObjectId.isValid(issueId) || !Types.ObjectId.isValid(proposalId)) {
            throw new ProposalSelectionError("INVALID_ID", "Invalid issue or proposal ID format");
        }

        const issueObjectId = new Types.ObjectId(issueId);
        const proposalObjectId = new Types.ObjectId(proposalId);

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 1. Validate proposal within transaction
            const proposal = await ProposalModel.findById(proposalObjectId).session(session);
            if (!proposal) {
                throw new ProposalSelectionError("PROPOSAL_NOT_FOUND", "Proposal not found");
            }

            if (proposal.issueId.toString() !== issueObjectId.toString()) {
                throw new ProposalSelectionError(
                    "PROPOSAL_NOT_MATCH_ISSUE",
                    "Proposal does not belong to the specified issue"
                );
            }

            if (proposal.status !== ProposalStatus.SUBMITTED) {
                throw new ProposalSelectionError(
                    "PROPOSAL_NOT_SUBMITTED",
                    `Only proposals in SUBMITTED status can be selected (current: ${proposal.status})`
                );
            }

            // 2. Validate issue pre-conditions within transaction
            const issue = await IssueModel.findById(issueObjectId).session(session);
            if (!issue) {
                throw new ProposalSelectionError("ISSUE_NOT_FOUND", "Issue not found");
            }

            if (issue.status !== IssueStatus.VERIFIED) {
                throw new ProposalSelectionError(
                    "ISSUE_NOT_VERIFIED",
                    "Only verified civic issues are eligible for proposal selection"
                );
            }

            if (!issue.proposalDeadlineAt) {
                throw new ProposalSelectionError(
                    "MISSING_DEADLINE",
                    "Issue does not have a proposal submission deadline configured"
                );
            }

            if (serverNow.getTime() < issue.proposalDeadlineAt.getTime()) {
                throw new ProposalSelectionError(
                    "DEADLINE_NOT_PASSED",
                    "Proposal submission window is still open. Selection is only permitted after the deadline."
                );
            }

            if (issue.proposalWindowStatus === ProposalWindowStatus.CANCELLED) {
                throw new ProposalSelectionError(
                    "WINDOW_CANCELLED",
                    "Proposal submission window has been cancelled for this issue"
                );
            }

            if (issue.selectedProposalId) {
                throw new ProposalSelectionError(
                    "ALREADY_SELECTED",
                    "A proposal has already been selected for this issue"
                );
            }

            // 3. Concurrency Protection: Claim the issue conditionally within the transaction
            const claimedIssue = await IssueModel.findOneAndUpdate(
                {
                    _id: issueObjectId,
                    status: IssueStatus.VERIFIED,
                    proposalDeadlineAt: { $lte: serverNow },
                    proposalWindowStatus: { $ne: ProposalWindowStatus.CANCELLED },
                    $or: [
                        { selectedProposalId: { $exists: false } },
                        { selectedProposalId: null },
                    ],
                },
                {
                    $set: {
                        selectedProposalId: proposalObjectId,
                        proposalSelectedAt: serverNow,
                        proposalWindowStatus: ProposalWindowStatus.CLOSED,
                    },
                },
                { session, returnDocument: "after" }
            );

            if (!claimedIssue) {
                // Determine whether another selection succeeded or conditions mutated
                const latestIssue = await IssueModel.findById(issueObjectId).session(session);
                if (latestIssue?.selectedProposalId) {
                    throw new ProposalSelectionError(
                        "ALREADY_SELECTED",
                        "Another proposal has already been selected for this issue"
                    );
                }
                throw new ProposalSelectionError(
                    "CONCURRENT_CONFLICT",
                    "Failed to claim issue for proposal selection due to concurrent modification"
                );
            }

            // 4. Update the selected proposal from SUBMITTED to SELECTED
            const updatedProposal = await ProposalModel.findOneAndUpdate(
                {
                    _id: proposalObjectId,
                    issueId: issueObjectId,
                    status: ProposalStatus.SUBMITTED,
                },
                {
                    $set: {
                        status: ProposalStatus.SELECTED,
                    },
                },
                { session, returnDocument: "after" }
            );

            if (!updatedProposal) {
                throw new ProposalSelectionError(
                    "PROPOSAL_NOT_SUBMITTED",
                    "Selected proposal could not be updated to selected status"
                );
            }

            // 5. Update all other SUBMITTED proposals for the same issue to NOT_SELECTED
            await ProposalModel.updateMany(
                {
                    issueId: issueObjectId,
                    _id: { $ne: proposalObjectId },
                    status: ProposalStatus.SUBMITTED,
                },
                {
                    $set: {
                        status: ProposalStatus.NOT_SELECTED,
                    },
                },
                { session }
            );

            // 6. Commit the transaction
            await session.commitTransaction();

            return {
                issueId: claimedIssue._id.toString(),
                selectedProposalId: updatedProposal._id.toString(),
                selectedProposalStatus: ProposalStatus.SELECTED,
                proposalSelectedAt: serverNow,
                proposalWindowStatus: ProposalWindowStatus.CLOSED,
            };
        } catch (error: unknown) {
            await session.abortTransaction();

            if (error instanceof ProposalSelectionError) {
                throw error;
            }

            const err = error as {
                code?: number;
                hasErrorLabel?: (label: string) => boolean;
                message?: string;
                errorLabels?: string[];
            };

            const isWriteConflict =
                err?.code === 112 ||
                err?.hasErrorLabel?.("TransientTransactionError") ||
                (Array.isArray(err?.errorLabels) && err.errorLabels.includes("TransientTransactionError")) ||
                (typeof err?.message === "string" && err.message.includes("WriteConflict"));

            if (isWriteConflict) {
                throw new ProposalSelectionError(
                    "CONCURRENT_CONFLICT",
                    "A concurrent administrative action is currently modifying this issue's proposal selection. Please refresh and review the latest state."
                );
            }

            throw error;
        } finally {
            await session.endSession();
        }
    }
}

