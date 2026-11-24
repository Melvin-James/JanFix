import { Types } from "mongoose";
import type { ISelectProposalUseCase } from "../usecase interfaces/admin/ISelectProposalUseCase.ts";
import type { IProposalSelectionRepository } from "../../../domain/interface/IProposalSelectionRepository.ts";
import type { IProposalRepository } from "../../../domain/interface/IProposalRepository.ts";
import type { IIssueRepository } from "../../../domain/interface/IIssueRepository.ts";
import type { INotificationRepository } from "../../../domain/interface/INotificationRepository.ts";
import { ProposalSelectionError } from "../../../domain/interface/IProposalSelectionRepository.ts";
import { ProposalStatus } from "../../../domain/enums/ProposalStatus.ts";
import { IssueStatus } from "../../../domain/enums/IssueStatus.ts";
import { NotificationType } from "../../../domain/enums/NotificationType.ts";
import type { SelectProposalResponseDTO } from "../../dto/admin/SelectProposalResponseDTO.ts";
import ApiError from "../../../shared/utils/apiError.ts";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.ts";

export class SelectProposalUseCase implements ISelectProposalUseCase {
    constructor(
        private readonly _proposalSelectionRepository: IProposalSelectionRepository,
        private readonly _proposalRepository?: IProposalRepository,
        private readonly _issueRepository?: IIssueRepository,
        private readonly _notificationRepository?: INotificationRepository
    ) {}

    async execute(
        issueId: string,
        proposalId: string,
        serverNow: Date = new Date()
    ): Promise<SelectProposalResponseDTO> {
        if (!issueId || !Types.ObjectId.isValid(issueId)) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "Invalid issue ID format");
        }
        if (!proposalId || !Types.ObjectId.isValid(proposalId)) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "Invalid proposal ID format");
        }

        try {
            const result = await this._proposalSelectionRepository.selectProposalAtomic(
                issueId,
                proposalId,
                serverNow
            );

            // Post-commit: Asynchronous notification dispatch (fail-safe)
            if (this._notificationRepository && this._proposalRepository && this._issueRepository) {
                try {
                    const [issue, allProposals] = await Promise.all([
                        this._issueRepository.findById(issueId),
                        this._proposalRepository.findSubmittedByIssueId(issueId),
                    ]);

                    if (issue) {
                        const notifications = [];

                        // 1. Notify selected provider
                        const selectedProposal = allProposals.find(
                            (p) => p.id === proposalId || p.status === ProposalStatus.SELECTED
                        );
                        if (selectedProposal) {
                            notifications.push({
                                recipientId: selectedProposal.providerId,
                                type: NotificationType.PROPOSAL_SELECTED,
                                title: "Your Proposal Was Selected!",
                                message: `Congratulations! Your proposal for "${issue.title}" was selected by the moderation team.`,
                                issueId,
                                proposalId,
                                isRead: false,
                            });
                        }

                        // 2. Notify other unselected providers
                        const otherProposals = allProposals.filter(
                            (p) => p.id !== proposalId && p.providerId !== selectedProposal?.providerId
                        );
                        for (const unselected of otherProposals) {
                            notifications.push({
                                recipientId: unselected.providerId,
                                type: NotificationType.PROPOSAL_NOT_SELECTED,
                                title: "Proposal Selection Update",
                                message: `Another proposal was selected for "${issue.title}". Thank you for your civic contribution.`,
                                issueId,
                                proposalId: unselected.id,
                                isRead: false,
                            });
                        }

                        // 3. Notify issue reporter
                        if (issue.createdBy) {
                            const isNgoOwn = result.issueStatus === IssueStatus.PLANNED;
                            notifications.push({
                                recipientId: issue.createdBy,
                                type: NotificationType.REPORTER_PROPOSAL_SELECTED,
                                title: "A Proposal Was Selected For Your Reported Issue",
                                message: isNgoOwn
                                    ? `A proposal has been selected for "${issue.title}". The project is now planned for execution by the organization!`
                                    : `A proposal has been selected for "${issue.title}". Community fundraising is now officially open!`,
                                issueId,
                                proposalId,
                                isRead: false,
                            });
                        }

                        if (notifications.length > 0) {
                            await this._notificationRepository.createMany(notifications);
                        }
                    }
                } catch (notifError) {
                    console.error("Failed to dispatch proposal selection notifications:", notifError);
                }
            }

            return {
                issueId: result.issueId,
                issueStatus: result.issueStatus,
                selectedProposalId: result.selectedProposalId,
                selectedProposalStatus: result.selectedProposalStatus,
                proposalSelectedAt: result.proposalSelectedAt.toISOString(),
                proposalWindowStatus: result.proposalWindowStatus,
                isCommunityIssue: result.isCommunityIssue,
                fundingSnapshot: result.fundingSnapshot
                    ? {
                        fundingType: result.fundingSnapshot.fundingType,
                        providerBudgetPaise: result.fundingSnapshot.providerBudgetPaise,
                        providerBudgetRupees: result.fundingSnapshot.providerBudgetPaise / 100,
                        platformFeeRatePercent: result.fundingSnapshot.platformFeeRatePercent,
                        platformFeePaise: result.fundingSnapshot.platformFeePaise,
                        platformFeeRupees: result.fundingSnapshot.platformFeePaise / 100,
                        fundingTargetPaise: result.fundingSnapshot.fundingTargetPaise,
                        fundingTargetRupees: result.fundingSnapshot.fundingTargetPaise / 100,
                        amountRaisedPaise: result.fundingSnapshot.amountRaisedPaise,
                        amountRaisedRupees: result.fundingSnapshot.amountRaisedPaise / 100,
                        selectedProposalId: result.fundingSnapshot.selectedProposalId,
                        selectedAt: result.fundingSnapshot.selectedAt.toISOString(),
                    }
                    : undefined,
            };
        } catch (error) {
            if (error instanceof ProposalSelectionError) {
                switch (error.reason) {
                    case "INVALID_ID":
                        throw new ApiError(HttpStatusCode.BAD_REQUEST, error.message);
                    case "ISSUE_NOT_FOUND":
                        throw new ApiError(HttpStatusCode.NOT_FOUND, "Issue not found");
                    case "PROPOSAL_NOT_FOUND":
                    case "PROPOSAL_NOT_MATCH_ISSUE":
                        throw new ApiError(HttpStatusCode.NOT_FOUND, error.message);
                    case "MISSING_DEADLINE":
                    case "DEADLINE_NOT_PASSED":
                    case "WINDOW_CANCELLED":
                    case "ISSUE_NOT_VERIFIED":
                        throw new ApiError(HttpStatusCode.BAD_REQUEST, error.message);
                    case "PROPOSAL_NOT_SUBMITTED":
                    case "ALREADY_SELECTED":
                    case "CONCURRENT_CONFLICT":
                        throw new ApiError(HttpStatusCode.CONFLICT, error.message);
                    default:
                        throw new ApiError(HttpStatusCode.INTERNAL_SERVER_ERROR, error.message);
                }
            }

            if (error instanceof ApiError) {
                throw error;
            }

            throw new ApiError(
                HttpStatusCode.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred while selecting the proposal"
            );
        }
    }
}

