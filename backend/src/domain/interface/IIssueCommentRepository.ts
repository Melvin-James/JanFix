import type { IssueCommentResponseDTO } from "../../application/dto/issue/IssueCommentResponseDTO.js";
import type { PaginatedResult } from "../../shared/types/Pagination.js";

export interface IIssueCommentRepository {
    createComment(issueId: string, userId: string, body: string): Promise<IssueCommentResponseDTO>;
    findCommentsByIssueId(
        issueId: string,
        page: number,
        pageSize: number
    ): Promise<PaginatedResult<IssueCommentResponseDTO>>;
}
