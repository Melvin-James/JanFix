import type { IssueResponseDTO } from "../../../dto/issue/IssueResponseDTO.js";
import type { PaginatedResult } from "../../../../shared/types/Pagination.js";
import type { IssueFilters } from "../../../../domain/interface/IIssueRepository.js";

export interface IGetFeedIssuesUseCase {
    execute(
        requestingUserId: string | undefined,
        page?: number,
        pageSize?: number,
        filters?: IssueFilters
    ): Promise<PaginatedResult<IssueResponseDTO>>;
}
