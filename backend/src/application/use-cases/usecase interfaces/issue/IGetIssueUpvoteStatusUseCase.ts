import type { IssueVoteResponseDTO } from "../../../dto/issue/IssueVoteResponseDTO.ts";

export interface IGetIssueUpvoteStatusUseCase {
    execute(issueId: string, userId?: string): Promise<IssueVoteResponseDTO>;
}
