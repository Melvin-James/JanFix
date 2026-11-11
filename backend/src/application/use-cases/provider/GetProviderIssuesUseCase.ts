import { Types } from "mongoose";
import type { IIssueRepository } from "../../../domain/interface/IIssueRepository.js";
import type { IProposalRepository } from "../../../domain/interface/IProposalRepository.js";
import type { IStorageService } from "../../services/IStorageService.js";
import type { PaginatedResult } from "../../../shared/types/Pagination.js";
import type { ProviderIssueResponseDTO } from "../../dto/provider/ProviderIssueResponseDTO.js";
import type { IGetProviderIssuesUseCase, ProviderIssueFilters } from "../usecase interfaces/provider/IGetProviderIssuesUseCase.js";
import { IssueAppMapper } from "../../mappers/IssueAppMapper.js";
import { refreshUploadedFileUrls } from "../../services/refreshUploadedFileUrls.js";
import { IssueInterestModel } from "../../../infrastructure/models/IssueInterestModel.js";
import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";

export class GetProviderIssuesUseCase implements IGetProviderIssuesUseCase {
    constructor(
        private readonly issueRepository: IIssueRepository,
        private readonly proposalRepository: IProposalRepository,
        private readonly storageService: IStorageService,
        private readonly userRepository: IUserRepository
    ) {}

    async execute(
        providerId: string,
        page = 1,
        pageSize = 10,
        filters?: ProviderIssueFilters
    ): Promise<PaginatedResult<ProviderIssueResponseDTO>> {

        const provider = await this.userRepository.findById(providerId);

        if(!provider){
            throw new Error("Provider not found");
        }

        const providerCategoryIds = provider.providerProfile?.workPreferences?.categoriesWillingToWork ?? [];

        if(providerCategoryIds.length === 0) {
            return {
                items: [],
                pagination: {
                    page: Math.max(1, page),
                    pageSize: Math.min(100, Math.max(1, pageSize)),
                    totalItems: 0,
                    totalPages: 0,
                },
            };
        }

        const paginated = await this.issueRepository.findProviderIssues(
            page,
            pageSize,
            providerCategoryIds,
            filters
        );

        const issueIds = paginated.items.map((issue) => issue.id!).filter(Boolean);

        // Fetch proposal counts, submitted state, and legacy expressed interest concurrently
        const validObjectIds = issueIds.filter((id) => Types.ObjectId.isValid(id)).map((id) => new Types.ObjectId(id));
        const [submittedIssueIds, proposalCountMap, legacyInterests] = await Promise.all([
            this.proposalRepository.findSubmittedIssueIdsByProvider(providerId, issueIds),
            this.proposalRepository.countSubmittedForIssues(issueIds),
            Types.ObjectId.isValid(providerId)
                ? IssueInterestModel.find({
                      providerId: new Types.ObjectId(providerId),
                      issueId: { $in: validObjectIds },
                  }).select("issueId").lean()
                : Promise.resolve([]),
        ]);

        const submittedSet = new Set(submittedIssueIds);
        const legacySet = new Set(legacyInterests.map((d) => d.issueId.toString()));
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
                const hasExpressedInterest = hasSubmittedProposal || Boolean(issue.id && legacySet.has(issue.id));

                return {
                    ...response,
                    images: refreshedImages,
                    hasSubmittedProposal,
                    proposalCount,
                    hasExpressedInterest,
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
