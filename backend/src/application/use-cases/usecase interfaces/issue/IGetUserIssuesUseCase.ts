import type { IssueResponseDTO } from "../../../dto/issue/IssueResponseDTO.js";
import type { PaginatedResult } from "../../../../shared/types/Pagination.js";

export interface IGetUserIssuesUseCase {
    execute(
        userId: string,
        page?: number,
        pageSize?: number
    ): Promise<PaginatedResult<IssueResponseDTO>>;
}
