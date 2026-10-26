import type { AdminIssueListItemDTO } from "../../../dto/admin/AdminIssueResponseDTO.js";
import type { PaginatedResult } from "../../../../shared/types/Pagination.js";
import type { AdminIssueFilters } from "../../../../domain/interface/IIssueRepository.js";

export interface IGetReviewEligibleIssuesUseCase {
    execute(
        page?: number,
        pageSize?: number,
        filters?: AdminIssueFilters,
        serverNow?: Date
    ): Promise<PaginatedResult<AdminIssueListItemDTO>>;
}
