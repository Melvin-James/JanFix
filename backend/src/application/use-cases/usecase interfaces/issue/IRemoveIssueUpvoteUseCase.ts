import type { IssueVoteResponseDTO } from "../../../dto/issue/IssueVoteResponseDTO.js";

export interface IRemoveIssueUpvoteUseCase {
    execute(issueId: string, userId: string): Promise<IssueVoteResponseDTO>;
}
