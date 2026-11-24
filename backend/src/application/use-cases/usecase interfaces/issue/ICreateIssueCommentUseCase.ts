import type { IssueCommentResponseDTO } from "../../../dto/issue/IssueCommentResponseDTO.ts";

export interface ICreateIssueCommentUseCase {
    execute(issueId: string, userId: string, body: string): Promise<IssueCommentResponseDTO>;
}
