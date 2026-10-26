export interface IIssueVoteRepository {
    addVote(issueId: string, userId: string): Promise<boolean>;
    removeVote(issueId: string, userId: string): Promise<boolean>;
    hasUserVoted(issueId: string, userId: string): Promise<boolean>;
    countByIssueId(issueId: string): Promise<number>;
}
