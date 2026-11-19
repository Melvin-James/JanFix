import { Types } from "mongoose";
import type { ISelectProposalUseCase } from "../usecase interfaces/admin/ISelectProposalUseCase.js";
import type { IProposalSelectionRepository } from "../../../domain/interface/IProposalSelectionRepository.js";
import { ProposalSelectionError } from "../../../domain/interface/IProposalSelectionRepository.js";
import type { SelectProposalResponseDTO } from "../../dto/admin/SelectProposalResponseDTO.js";
import ApiError from "../../../shared/utils/apiError.js";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

export class SelectProposalUseCase implements ISelectProposalUseCase {
    constructor(
        private readonly proposalSelectionRepository: IProposalSelectionRepository
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
            const result = await this.proposalSelectionRepository.selectProposalAtomic(
                issueId,
                proposalId,
                serverNow
            );

            return {
                issueId: result.issueId,
                selectedProposalId: result.selectedProposalId,
                selectedProposalStatus: result.selectedProposalStatus,
                proposalSelectedAt: result.proposalSelectedAt.toISOString(),
                proposalWindowStatus: result.proposalWindowStatus,
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

