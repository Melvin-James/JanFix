import type { IssueVoteResponseDTO } from "../../../dto/issue/IssueVoteResponseDTO.ts";

export interface IAddIssueUpvoteUseCase {
    execute(issueId: string, userId: string): Promise<IssueVoteResponseDTO>;
}
