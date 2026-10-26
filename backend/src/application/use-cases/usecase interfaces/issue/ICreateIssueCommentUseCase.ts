import type { IssueCommentResponseDTO } from "../../../dto/issue/IssueCommentResponseDTO.js";

export interface ICreateIssueCommentUseCase {
    execute(issueId: string, userId: string, body: string): Promise<IssueCommentResponseDTO>;
}
