import type { IIssueRepository } from "../../../domain/interface/IIssueRepository.js";
import type { IIssueInterestRepository } from "../../../domain/interface/IIssueInterestRepository.js";
import type { IStorageService } from "../../services/IStorageService.js";
import type { PaginatedResult } from "../../../shared/types/Pagination.js";
import type { ProviderIssueResponseDTO } from "../../dto/provider/ProviderIssueResponseDTO.js";
import type { IGetProviderIssuesUseCase, ProviderIssueFilters } from "../usecase interfaces/provider/IGetProviderIssuesUseCase.js";
import { IssueAppMapper } from "../../mappers/IssueAppMapper.js";
import { refreshUploadedFileUrls } from "../../services/refreshUploadedFileUrls.js";

export class GetProviderIssuesUseCase implements IGetProviderIssuesUseCase {
    constructor(
        private readonly issueRepository: IIssueRepository,
        private readonly issueInterestRepository: IIssueInterestRepository,
        private readonly storageService: IStorageService
    ) {}

    async execute(
        providerId: string,
        page = 1,
        pageSize = 10,
        filters?: ProviderIssueFilters
    ): Promise<PaginatedResult<ProviderIssueResponseDTO>> {
        const paginated = await this.issueRepository.findProviderIssues(
            page,
            pageSize,
            filters
        );

        // Fetch all issue IDs that this provider has already expressed interest in
        const expressedIssueIds = await this.issueInterestRepository.findInterestsByProvider(providerId);
        const expressedSet = new Set(expressedIssueIds);

        const urlCache = new Map<string, string>();

        const items: ProviderIssueResponseDTO[] = await Promise.all(
            paginated.items.map(async (issue) => {
                const response = IssueAppMapper.toResponse(issue);
                const refreshedImages = await refreshUploadedFileUrls(
                    response.images,
                    this.storageService,
                    urlCache
                );

                return {
                    ...response,
                    images: refreshedImages,
                    hasExpressedInterest: Boolean(issue.id && expressedSet.has(issue.id)),
                };
            })
        );

        return {
            items,
            pagination: paginated.pagination,
        };
    }
}

export default GetProviderIssuesUseCase;
