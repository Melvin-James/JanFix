import type { IIssueRepository } from "../../../domain/interface/IIssueRepository.js";
import type { IProposalRepository } from "../../../domain/interface/IProposalRepository.js";
import type { IStorageService } from "../../services/IStorageService.js";
import type { PaginatedResult } from "../../../shared/types/Pagination.js";
import type { ProviderIssueResponseDTO } from "../../dto/provider/ProviderIssueResponseDTO.js";
import type { IGetProviderIssuesUseCase, ProviderIssueFilters } from "../usecase interfaces/provider/IGetProviderIssuesUseCase.js";
import { IssueAppMapper } from "../../mappers/IssueAppMapper.js";
import { refreshUploadedFileUrls } from "../../services/refreshUploadedFileUrls.js";

export class GetProviderIssuesUseCase implements IGetProviderIssuesUseCase {
    constructor(
        private readonly issueRepository: IIssueRepository,
        private readonly proposalRepository: IProposalRepository,
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

        const issueIds = paginated.items.map((issue) => issue.id!).filter(Boolean);

        // Fetch proposal counts and submitted state concurrently
        const [submittedIssueIds, proposalCountMap] = await Promise.all([
            this.proposalRepository.findSubmittedIssueIdsByProvider(providerId, issueIds),
            this.proposalRepository.countSubmittedForIssues(issueIds),
        ]);

        const submittedSet = new Set(submittedIssueIds);
        const urlCache = new Map<string, string>();

        const items: ProviderIssueResponseDTO[] = await Promise.all(
            paginated.items.map(async (issue) => {
                const response = IssueAppMapper.toResponse(issue);
                const refreshedImages = await refreshUploadedFileUrls(
                    response.images,
                    this.storageService,
                    urlCache
                );

                const hasSubmittedProposal = Boolean(issue.id && submittedSet.has(issue.id));
                const proposalCount = issue.id ? (proposalCountMap.get(issue.id) || 0) : 0;

                return {
                    ...response,
                    images: refreshedImages,
                    hasSubmittedProposal,
                    proposalCount,
                    hasExpressedInterest: hasSubmittedProposal,
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
