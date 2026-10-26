export interface CommentAuthorDTO {
    id: string;
    fullName: string;
}

export interface IssueCommentResponseDTO {
    id: string;
    issueId: string;
    body: string;
    author: CommentAuthorDTO;
    createdAt: Date;
    updatedAt: Date;
}
