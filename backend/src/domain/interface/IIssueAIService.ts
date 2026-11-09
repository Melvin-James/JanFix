import type { CommentClassification } from "../enums/CommentClassification.js";

export interface AICommentInput {
    id: string;
    body: string;
}

export interface AIClassifiedComment {
    commentId: string;
    classification: CommentClassification;
    explanation?: string | undefined;
}

export interface IssueAIAnalysisResult {
    summary: string;
    classifications: AIClassifiedComment[];
    modelUsed: string;
}

export interface IIssueAIService {
    analyzeCommunityComments(
        issueTitle: string,
        issueDescription: string | undefined,
        comments: AICommentInput[]
    ): Promise<IssueAIAnalysisResult>;
}

