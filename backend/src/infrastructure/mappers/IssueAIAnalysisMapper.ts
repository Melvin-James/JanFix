import type { Document } from "mongoose";
import type { IssueAIAnalysis } from "../../domain/entities/IssueAIAnalysis.js";
import type { IssueAIAnalysisDocument } from "../models/IssueAIAnalysisModel.js";

export class IssueAIAnalysisMapper {
    static toEntity(doc: Document): IssueAIAnalysis {
        const document = doc as IssueAIAnalysisDocument;
        return {
            id: document._id.toString(),
            issueId: document.issueId.toString(),
            status: document.status,
            cutoffDate: document.cutoffDate,
            totalEligibleComments: document.totalEligibleComments,
            supportCount: document.supportCount,
            challengeCount: document.challengeCount,
            neutralCount: document.neutralCount,
            score: document.score,
            overallClassification: document.overallClassification,
            summary: document.summary,
            commentClassifications: (document.commentClassifications || []).map((c) => ({
                commentId: c.commentId,
                classification: c.classification,
                explanation: c.explanation,
            })),
            modelUsed: document.modelUsed,
            completedAt: document.completedAt,
            errorMessage: document.errorMessage,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
        };
    }
}

