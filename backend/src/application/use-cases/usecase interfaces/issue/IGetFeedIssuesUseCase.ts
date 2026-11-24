import type { IssueResponseDTO } from "../../../dto/issue/IssueResponseDTO.ts";
import type { PaginatedResult } from "../../../../shared/types/Pagination.ts";
import type { IssueFilters } from "../../../../domain/interface/IIssueRepository.ts";

export interface IGetFeedIssuesUseCase {
    execute(
        requestingUserId: string | undefined,
        page?: number,
        pageSize?: number,
        filters?: IssueFilters
    ): Promise<PaginatedResult<IssueResponseDTO>>;
}
