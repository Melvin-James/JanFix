import type { IssueVoteResponseDTO } from "../../../dto/issue/IssueVoteResponseDTO.ts";

export interface IRemoveIssueUpvoteUseCase {
    execute(issueId: string, userId: string): Promise<IssueVoteResponseDTO>;
}
