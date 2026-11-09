import type { IssueAIAnalysis } from "../../domain/entities/IssueAIAnalysis.js";
import type { IssueAIAnalysisResponseDTO } from "../dto/admin/IssueAIAnalysisResponseDTO.js";

export class IssueAIAnalysisAppMapper {
    static toResponse(
        entity: IssueAIAnalysis,
        options: { canTriggerAnalysis: boolean; isEligibleForAnalysis: boolean }
    ): IssueAIAnalysisResponseDTO {
        return {
            id: entity.id,
            issueId: entity.issueId,
            status: entity.status,
            cutoffDate: entity.cutoffDate.toISOString(),
            totalEligibleComments: entity.totalEligibleComments,
            supportCount: entity.supportCount,
            challengeCount: entity.challengeCount,
            neutralCount: entity.neutralCount,
            score: entity.score,
            overallClassification: entity.overallClassification,
            summary: entity.summary,
            commentClassifications: entity.commentClassifications.map((c) => ({
                commentId: c.commentId,
                classification: c.classification,
                explanation: c.explanation,
            })),
            completedAt: entity.completedAt ? entity.completedAt.toISOString() : undefined,
            errorMessage: entity.errorMessage,
            canTriggerAnalysis: options.canTriggerAnalysis,
            isEligibleForAnalysis: options.isEligibleForAnalysis,
        };
    }
}

