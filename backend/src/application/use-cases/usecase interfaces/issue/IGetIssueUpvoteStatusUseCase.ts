import type { IssueVoteResponseDTO } from "../../../dto/issue/IssueVoteResponseDTO.js";

export interface IGetIssueUpvoteStatusUseCase {
    execute(issueId: string, userId?: string): Promise<IssueVoteResponseDTO>;
}
