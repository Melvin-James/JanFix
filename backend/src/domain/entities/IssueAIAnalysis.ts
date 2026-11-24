import type { AIAnalysisStatus } from "../enums/AIAnalysisStatus.ts";
import type { AIOverallClassification } from "../enums/AIOverallClassification.ts";
import type { CommentClassification } from "../enums/CommentClassification.ts";

export interface AICommentClassificationItem {
    commentId: string;
    classification: CommentClassification;
    explanation?: string | undefined;
}

export interface IssueAIAnalysis {
    id?: string | undefined;
    issueId: string;
    status: AIAnalysisStatus;
    cutoffDate: Date;
    totalEligibleComments: number;
    supportCount: number;
    challengeCount: number;
    neutralCount: number;
    score: number | null;
    overallClassification: AIOverallClassification;
    summary: string;
    commentClassifications: AICommentClassificationItem[];
    modelUsed?: string | undefined;
    completedAt?: Date | undefined;
    errorMessage?: string | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
}

