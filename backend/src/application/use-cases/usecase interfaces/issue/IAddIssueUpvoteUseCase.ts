import type { IssueVoteResponseDTO } from "../../../dto/issue/IssueVoteResponseDTO.js";

export interface IAddIssueUpvoteUseCase {
    execute(issueId: string, userId: string): Promise<IssueVoteResponseDTO>;
}
