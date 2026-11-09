export type CommentClassification = "SUPPORTS_REPORT" | "CHALLENGES_REPORT" | "NEUTRAL";

export type AIOverallClassification =
  | "COMMUNITY_LEANING_SUPPORT"
  | "COMMUNITY_LEANING_CHALLENGE"
  | "MIXED_FEEDBACK"
  | "INSUFFICIENT_DATA";

export type AIAnalysisStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "INSUFFICIENT_DATA"
  | "FAILED";

export interface AICommentClassificationDTO {
  commentId: string;
  classification: CommentClassification;
  explanation?: string;
}

export interface IssueAIAnalysis {
  id?: string;
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
  completedAt?: string;
  errorMessage?: string;
  canTriggerAnalysis: boolean;
  isEligibleForAnalysis: boolean;
}

export interface IssueAIAnalysisResponse {
  success: boolean;
  message?: string;
  analysis: IssueAIAnalysis;
}