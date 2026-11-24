import type { IssueCommentResponseDTO } from "../../application/dto/issue/IssueCommentResponseDTO.ts";
import type { PaginatedResult } from "../../shared/types/Pagination.ts";

export interface IIssueCommentRepository {
    createComment(issueId: string, userId: string, body: string): Promise<IssueCommentResponseDTO>;
    findCommentsByIssueId(
        issueId: string,
        page: number,
        pageSize: number
    ): Promise<PaginatedResult<IssueCommentResponseDTO>>;
}
