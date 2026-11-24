import type { AdminIssueListItemDTO } from "../../../dto/admin/AdminIssueResponseDTO.ts";
import type { PaginatedResult } from "../../../../shared/types/Pagination.ts";
import type { AdminIssueFilters } from "../../../../domain/interface/IIssueRepository.ts";

export interface IGetReviewEligibleIssuesUseCase {
    execute(
        page?: number,
        pageSize?: number,
        filters?: AdminIssueFilters,
        serverNow?: Date
    ): Promise<PaginatedResult<AdminIssueListItemDTO>>;
}
