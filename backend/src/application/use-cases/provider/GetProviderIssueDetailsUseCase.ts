import type { IIssueRepository } from "../../../domain/interface/IIssueRepository.ts";
import type { IProposalRepository } from "../../../domain/interface/IProposalRepository.ts";
import type { IStorageService } from "../../services/IStorageService.ts";
import type { ProviderIssueResponseDTO } from "../../dto/provider/ProviderIssueResponseDTO.ts";
import type { IGetProviderIssueDetailsUseCase } from "../usecase interfaces/provider/IGetProviderIssueDetailsUseCase.ts";
import { IssueAppMapper } from "../../mappers/IssueAppMapper.ts";
import { refreshUploadedFileUrls } from "../../services/refreshUploadedFileUrls.ts";
import ApiError from "../../../shared/utils/apiError.ts";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.ts";
import { IssueStatus } from "../../../domain/enums/IssueStatus.ts";
import { ProposalStatus } from "../../../domain/enums/ProposalStatus.ts";

export class GetProviderIssueDetailsUseCase implements IGetProviderIssueDetailsUseCase {
    constructor(
        private readonly _issueRepository: IIssueRepository,
        private readonly _proposalRepository: IProposalRepository,
        private readonly _storageService: IStorageService
    ) {}

    async execute(issueId: string, providerId: string): Promise<ProviderIssueResponseDTO> {
        const issue = await this._issueRepository.findById(issueId);
        if (!issue) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, "Issue not found");
        }

        if (issue.status === IssueStatus.REJECTED) {
            throw new ApiError(
                HttpStatusCode.FORBIDDEN,
                "Service providers cannot view rejected issues"
            );
        }

        const response = IssueAppMapper.toResponse(issue, {
            includeRejectionReason: false,
        });

        const refreshedImages = await refreshUploadedFileUrls(
            response.images,
            this._storageService
        );

        const [existingProposal, proposalCount] = await Promise.all([
            this._proposalRepository.findByIssueAndProvider(issueId, providerId),
            this._proposalRepository.countSubmittedByIssue(issueId),
        ]);

        const hasSubmittedProposal = Boolean(
            existingProposal && existingProposal.status !== ProposalStatus.WITHDRAWN
        );

        return {
            ...response,
            images: refreshedImages,
            hasSubmittedProposal,
            proposalCount,
            hasExpressedInterest: hasSubmittedProposal,
        };
    }
}

export default GetProviderIssueDetailsUseCase;
