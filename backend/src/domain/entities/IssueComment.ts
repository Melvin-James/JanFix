export interface IssueComment {
    id?: string;
    issueId: string;
    userId: string;
    body: string;
    createdAt?: Date;
    updatedAt?: Date;
}
