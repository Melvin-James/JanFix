import { Types } from "mongoose";
import type { IWithdrawProposalUseCase } from "../usecase interfaces/provider/IWithdrawProposalUseCase.ts";
import type { IIssueRepository } from "../../../domain/interface/IIssueRepository.ts";
import type { IProposalRepository } from "../../../domain/interface/IProposalRepository.ts";
import { ProposalStatus } from "../../../domain/enums/ProposalStatus.ts";
import { ProposalWindowStatus } from "../../../domain/enums/ProposalWindowStatus.ts";
import ApiError from "../../../shared/utils/apiError.ts";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.ts";
import { PROPOSAL_SUBMISSION_WINDOW_MS } from "../../../shared/constants/proposal.constants.ts";

export class WithdrawProposalUseCase implements IWithdrawProposalUseCase {
    constructor(
        private readonly _issueRepository: IIssueRepository,
        private readonly _proposalRepository: IProposalRepository
    ) {}

    async execute(
        issueId: string,
        providerId: string,
        serverNow: Date = new Date()
    ): Promise<{ success: boolean; message: string }> {
        if (!issueId || !Types.ObjectId.isValid(issueId)) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "Invalid issue identifier");
        }
        if (!providerId || !Types.ObjectId.isValid(providerId)) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "Invalid provider identifier");
        }

        const issue = await this._issueRepository.findById(issueId);
        if (!issue) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, "Issue not found");
        }

        const fallbackDeadline = new Date(
            (issue.updatedAt || issue.createdAt || serverNow).getTime() + PROPOSAL_SUBMISSION_WINDOW_MS
        );
        const proposalDeadline = issue.proposalDeadlineAt || fallbackDeadline;

        if (
            issue.proposalWindowStatus === ProposalWindowStatus.CLOSED ||
            issue.proposalWindowStatus === ProposalWindowStatus.CANCELLED ||
            serverNow >= proposalDeadline
        ) {
            throw new ApiError(
                HttpStatusCode.BAD_REQUEST,
                "The proposal submission window has closed. Proposals cannot be withdrawn after the deadline."
            );
        }

        const proposal = await this._proposalRepository.findByIssueAndProvider(issueId, providerId);
        if (!proposal) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, "No proposal found for this issue");
        }

        if (proposal.status === ProposalStatus.WITHDRAWN) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "Proposal has already been withdrawn");
        }

        if (proposal.status !== ProposalStatus.SUBMITTED) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "Only submitted proposals can be withdrawn");
        }

        const updated = await this._proposalRepository.update(proposal.id!, {
            status: ProposalStatus.WITHDRAWN,
            withdrawnAt: serverNow,
        });

        if (!updated) {
            throw new ApiError(HttpStatusCode.INTERNAL_SERVER_ERROR, "Failed to withdraw proposal");
        }

        return {
            success: true,
            message: "Proposal withdrawn successfully",
        };
    }
}

export default WithdrawProposalUseCase;

