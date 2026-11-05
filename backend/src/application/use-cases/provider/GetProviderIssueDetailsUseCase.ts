import type { IIssueRepository } from "../../../domain/interface/IIssueRepository.js";
import type { IIssueInterestRepository } from "../../../domain/interface/IIssueInterestRepository.js";
import type { IStorageService } from "../../services/IStorageService.js";
import type { ProviderIssueResponseDTO } from "../../dto/provider/ProviderIssueResponseDTO.js";
import type { IGetProviderIssueDetailsUseCase } from "../usecase interfaces/provider/IGetProviderIssueDetailsUseCase.js";
import { IssueAppMapper } from "../../mappers/IssueAppMapper.js";
import { refreshUploadedFileUrls } from "../../services/refreshUploadedFileUrls.js";
import ApiError from "../../../shared/utils/apiError.js";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";
import { IssueStatus } from "../../../domain/enums/IssueStatus.js";

export class GetProviderIssueDetailsUseCase implements IGetProviderIssueDetailsUseCase {
    constructor(
        private readonly issueRepository: IIssueRepository,
        private readonly issueInterestRepository: IIssueInterestRepository,
        private readonly storageService: IStorageService
    ) {}

    async execute(issueId: string, providerId: string): Promise<ProviderIssueResponseDTO> {
        const issue = await this.issueRepository.findById(issueId);
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
            this.storageService
        );

        const hasExpressedInterest = await this.issueInterestRepository.exists(
            issueId,
            providerId
        );

        return {
            ...response,
            images: refreshedImages,
            hasExpressedInterest,
        };
    }
}

export default GetProviderIssueDetailsUseCase;