import type { IIssueRepository, AdminIssueFilters } from "../../../domain/interface/IIssueRepository.ts";
import type { IStorageService } from "../../services/IStorageService.ts";
import type { IGetReviewEligibleIssuesUseCase } from "../usecase interfaces/admin/IGetReviewEligibleIssuesUseCase.ts";
import type { AdminIssueListItemDTO } from "../../dto/admin/AdminIssueResponseDTO.ts";
import type { PaginatedResult } from "../../../shared/types/Pagination.ts";
import { refreshUploadedFileUrls } from "../../services/refreshUploadedFileUrls.ts";
import ApiError from "../../../shared/utils/apiError.ts";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.ts";

export class GetReviewEligibleIssuesUseCase implements IGetReviewEligibleIssuesUseCase {
    constructor(
        private readonly _issueRepository: IIssueRepository,
        private readonly _storageService: IStorageService
    ) {}

    async execute(
        page = 1,
        pageSize = 10,
        filters?: AdminIssueFilters,
        serverNow: Date = new Date()
    ): Promise<PaginatedResult<AdminIssueListItemDTO>> {
        if (page !== undefined && (!Number.isInteger(page) || page < 1)) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "Page must be a positive integer");
        }

        if (pageSize !== undefined && (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100)) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "Page size must be between 1 and 100");
        }

        const safePage = page > 0 ? page : 1;
        const safePageSize = pageSize > 0 && pageSize <= 100 ? pageSize : 10;

        const paginatedResult = await this._issueRepository.findReviewEligibleIssues(
            safePage,
            safePageSize,
            filters,
            serverNow
        );

        const urlCache = new Map<string, string>();

        const items: AdminIssueListItemDTO[] = await Promise.all(
            paginatedResult.items.map(async (item) => {
                const refreshedImages = await refreshUploadedFileUrls(
                    item.issue.images,
                    this._storageService,
                    urlCache
                );

                return {
                    id: item.issue.id || "",
                    title: item.issue.title,
                    description: item.issue.description,
                    category: item.category,
                    reporter: item.reporter,
                    images: refreshedImages,
                    visibility: item.issue.visibility,
                    location: item.issue.location,
                    status: item.issue.status,
                    upvoteCount: item.upvoteCount,
                    commentCount: item.commentCount,
                    createdAt: item.issue.createdAt || new Date(),
                    updatedAt: item.issue.updatedAt || new Date(),
                };
            })
        );

        return {
            items,
            pagination: paginatedResult.pagination,
        };
    }
}
export default GetReviewEligibleIssuesUseCase;
