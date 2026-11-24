import type { IGetIssuesWithProposalsUseCase } from "../usecase interfaces/admin/IGetIssuesWithProposalsUseCase.ts";
import type { IProposalRepository, IssueWithProposalsFilters } from "../../../domain/interface/IProposalRepository.ts";
import type { IStorageService } from "../../services/IStorageService.ts";
import type { PaginatedResult } from "../../../shared/types/Pagination.ts";
import type { AdminIssueProposalSummaryDTO, ProviderPreviewDTO } from "../../dto/admin/AdminIssueProposalSummaryDTO.ts";
import { refreshUploadedFileUrls } from "../../services/refreshUploadedFileUrls.ts";
import type { ProposalWindowStatus } from "../../../domain/enums/ProposalWindowStatus.ts";

export class GetIssuesWithProposalsUseCase implements IGetIssuesWithProposalsUseCase {
    constructor(
        private readonly _proposalRepository: IProposalRepository,
        private readonly _storageService: IStorageService
    ) {}

    async execute(
        page = 1,
        pageSize = 10,
        filters?: IssueWithProposalsFilters
    ): Promise<PaginatedResult<AdminIssueProposalSummaryDTO>> {
        const result = await this._proposalRepository.findIssuesWithProposals(page, pageSize, filters);
        const urlCache = new Map<string, string>();

        const items: AdminIssueProposalSummaryDTO[] = await Promise.all(
            result.items.map(async (group) => {
                const refreshedImages = await refreshUploadedFileUrls(
                    group.issue.images || [],
                    this._storageService,
                    urlCache
                );

                const providers: ProviderPreviewDTO[] = await Promise.all(
                    (group.providers || []).map(async (p) => {
                        let avatarUrl: string | undefined;
                        const profileImage = p.providerProfile?.documents?.profileImage;
                        const logo = p.providerProfile?.documents?.logo;
                        const targetImage = profileImage || logo;

                        if (targetImage) {
                            if (targetImage.key) {
                                if (urlCache.has(targetImage.key)) {
                                    avatarUrl = urlCache.get(targetImage.key);
                                } else {
                                    try {
                                        avatarUrl = await this._storageService.getPresignedUrl(targetImage.key);
                                        urlCache.set(targetImage.key, avatarUrl);
                                    } catch {
                                        avatarUrl = targetImage.url;
                                    }
                                }
                            } else {
                                avatarUrl = targetImage.url;
                            }
                        }

                        return {
                            id: p._id,
                            name: p.providerProfile?.identity?.providerName || p.fullName,
                            providerType: p.providerProfile?.identity?.providerType,
                            avatarUrl,
                        };
                    })
                );

                return {
                    issueId: group.issue._id,
                    title: group.issue.title,
                    description: group.issue.description,
                    category: group.issue.category
                        ? {
                              id: group.issue.category._id,
                              name: group.issue.category.name,
                          }
                        : null,
                    location: group.issue.location,
                    images: refreshedImages,
                    proposalCount: group.proposalCount,
                    proposalWindowStatus: group.issue.proposalWindowStatus as ProposalWindowStatus | undefined,
                    proposalDeadlineAt: group.issue.proposalDeadlineAt
                        ? new Date(group.issue.proposalDeadlineAt).toISOString()
                        : undefined,
                    createdAt: new Date(group.issue.createdAt).toISOString(),
                    latestProposalSubmittedAt: group.latestProposalSubmittedAt
                        ? new Date(group.latestProposalSubmittedAt).toISOString()
                        : undefined,
                    providers,
                };
            })
        );

        return {
            items,
            pagination: result.pagination,
        };
    }
}

export default GetIssuesWithProposalsUseCase;

