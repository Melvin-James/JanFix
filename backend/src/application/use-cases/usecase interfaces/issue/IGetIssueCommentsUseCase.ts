import type { IssueCommentResponseDTO } from "../../../dto/issue/IssueCommentResponseDTO.ts";
import type { PaginatedResult } from "../../../../shared/types/Pagination.ts";

export interface IGetIssueCommentsUseCase {
    execute(
        issueId: string,
        userId?: string,
        page?: number,
        pageSize?: number
    ): Promise<PaginatedResult<IssueCommentResponseDTO>>;
}
