import { Types } from "mongoose";
import type { IWithdrawProposalUseCase } from "../usecase interfaces/provider/IWithdrawProposalUseCase.js";
import type { IIssueRepository } from "../../../domain/interface/IIssueRepository.js";
import type { IProposalRepository } from "../../../domain/interface/IProposalRepository.js";
import { ProposalStatus } from "../../../domain/enums/ProposalStatus.js";
import { ProposalWindowStatus } from "../../../domain/enums/ProposalWindowStatus.js";
import ApiError from "../../../shared/utils/apiError.js";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

export class WithdrawProposalUseCase implements IWithdrawProposalUseCase {
    constructor(
        private readonly issueRepository: IIssueRepository,
        private readonly proposalRepository: IProposalRepository
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

        const issue = await this.issueRepository.findById(issueId);
        if (!issue) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, "Issue not found");
        }

        const fallbackDeadline = new Date(
            (issue.updatedAt || issue.createdAt || serverNow).getTime() + 5 * 24 * 60 * 60 * 1000
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

        const proposal = await this.proposalRepository.findByIssueAndProvider(issueId, providerId);
        if (!proposal) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, "No proposal found for this issue");
        }

        if (proposal.status === ProposalStatus.WITHDRAWN) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "Proposal has already been withdrawn");
        }

        const updated = await this.proposalRepository.update(proposal.id!, {
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

