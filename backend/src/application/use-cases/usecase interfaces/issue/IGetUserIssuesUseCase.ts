import type { IssueResponseDTO } from "../../../dto/issue/IssueResponseDTO.ts";
import type { PaginatedResult } from "../../../../shared/types/Pagination.ts";
import type { IssueFilters } from "../../../../domain/interface/IIssueRepository.ts";

export interface IGetUserIssuesUseCase {
    execute(
        userId: string,
        page?: number,
        pageSize?: number,
        filters?: IssueFilters
    ): Promise<PaginatedResult<IssueResponseDTO>>;
}
