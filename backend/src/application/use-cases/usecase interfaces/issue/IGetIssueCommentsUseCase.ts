import type { IssueCommentResponseDTO } from "../../../dto/issue/IssueCommentResponseDTO.js";
import type { PaginatedResult } from "../../../../shared/types/Pagination.js";

export interface IGetIssueCommentsUseCase {
    execute(
        issueId: string,
        userId?: string,
        page?: number,
        pageSize?: number
    ): Promise<PaginatedResult<IssueCommentResponseDTO>>;
}
