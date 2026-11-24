import type { AIAnalysisStatus } from "../../../domain/enums/AIAnalysisStatus.ts";
import type { AIOverallClassification } from "../../../domain/enums/AIOverallClassification.ts";
import type { CommentClassification } from "../../../domain/enums/CommentClassification.ts";

export interface AICommentClassificationDTO {
    commentId: string;
    classification: CommentClassification;
    explanation?: string | undefined;
}

export interface IssueAIAnalysisResponseDTO {
    id?: string | undefined;
    issueId: string;
    status: AIAnalysisStatus;
    cutoffDate: string;
    totalEligibleComments: number;
    supportCount: number;
    challengeCount: number;
    neutralCount: number;
    score: number | null;
    overallClassification: AIOverallClassification;
    summary: string;
    commentClassifications: AICommentClassificationDTO[];
    completedAt?: string | undefined;
    errorMessage?: string | undefined;
    canTriggerAnalysis: boolean;
    isEligibleForAnalysis: boolean;
}

