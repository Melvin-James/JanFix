import { Types } from "mongoose";
import type { IAnalyzeIssueCommentsUseCase } from "../usecase interfaces/admin/IAnalyzeIssueCommentsUseCase.js";
import type { IIssueRepository } from "../../../domain/interface/IIssueRepository.js";
import type { IIssueAIAnalysisRepository } from "../../../domain/interface/IIssueAIAnalysisRepository.js";
import type { IIssueAIService } from "../../../domain/interface/IIssueAIService.js";
import type { IssueAIAnalysisResponseDTO } from "../../dto/admin/IssueAIAnalysisResponseDTO.js";
import { IssueCommentModel } from "../../../infrastructure/models/IssueCommentModel.js";
import { IssueAIAnalysisAppMapper } from "../../mappers/IssueAIAnalysisAppMapper.js";
import { calculateCommunitySupportScore } from "../../services/communitySupportScoreCalculator.js";
import { isIssueEligibleForReview, getIssueInteractionDeadline } from "../../../shared/utils/issueEligibility.js";
import { AIAnalysisStatus } from "../../../domain/enums/AIAnalysisStatus.js";
import { AIOverallClassification } from "../../../domain/enums/AIOverallClassification.js";
import ApiError from "../../../shared/utils/apiError.js";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";
import logger from "../../../shared/utils/logger.js";

export class AnalyzeIssueCommentsUseCase implements IAnalyzeIssueCommentsUseCase {
    constructor(
        private readonly issueRepository: IIssueRepository,
        private readonly aiAnalysisRepository: IIssueAIAnalysisRepository,
        private readonly aiService: IIssueAIService
    ) {}

    async execute(issueId: string, serverNow: Date = new Date()): Promise<IssueAIAnalysisResponseDTO> {
        if (!Types.ObjectId.isValid(issueId)) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "Invalid issue ID format");
        }

        const issue = await this.issueRepository.findById(issueId);
        if (!issue) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, "Issue not found");
        }

        const issueCreatedAt = issue.createdAt || new Date();
        const cutoffDate = getIssueInteractionDeadline(issueCreatedAt);
        const isEligible = isIssueEligibleForReview(issueCreatedAt, serverNow);

        if (!isEligible) {
            throw new ApiError(
                HttpStatusCode.BAD_REQUEST,
                "JanAI analysis cannot run before the 24-hour community interaction period closes"
            );
        }

        // Acquire processing lock (idempotency & concurrency safe)
        const lockResult = await this.aiAnalysisRepository.acquireProcessingLock(issueId, cutoffDate);
        if (!lockResult.acquired && lockResult.analysis) {
            return IssueAIAnalysisAppMapper.toResponse(lockResult.analysis, {
                canTriggerAnalysis: lockResult.analysis.status === AIAnalysisStatus.FAILED,
                isEligibleForAnalysis: true,
            });
        }

        try {
            // Retrieve only comments posted on or before cutoff date
            const eligibleDocs = await IssueCommentModel.find({
                issueId: new Types.ObjectId(issueId),
                createdAt: { $lte: cutoffDate },
            })
                .select("_id body")
                .sort({ createdAt: 1 })
                .lean();

            // Scenario: No eligible comments submitted
            if (eligibleDocs.length === 0) {
                const noCommentsAnalysis = await this.aiAnalysisRepository.save({
                    issueId,
                    status: AIAnalysisStatus.INSUFFICIENT_DATA,
                    cutoffDate,
                    totalEligibleComments: 0,
                    supportCount: 0,
                    challengeCount: 0,
                    neutralCount: 0,
                    score: null,
                    overallClassification: AIOverallClassification.INSUFFICIENT_DATA,
                    summary: "No community comments were submitted during the 24-hour interaction period.",
                    commentClassifications: [],
                    completedAt: new Date(),
                });

                return IssueAIAnalysisAppMapper.toResponse(noCommentsAnalysis, {
                    canTriggerAnalysis: false,
                    isEligibleForAnalysis: true,
                });
            }

            // Input payload for AI (zero user PII)
            const commentInputs = eligibleDocs.map((doc) => ({
                id: doc._id.toString(),
                body: doc.body,
            }));

            // Call AI provider
            const aiResult = await this.aiService.analyzeCommunityComments(
                issue.title,
                issue.description,
                commentInputs
            );

            // Compute math score & classification strictly on the backend
            const scoreResult = calculateCommunitySupportScore(aiResult.classifications);

            // Analysis status: if there's no stance data, mark as INSUFFICIENT_DATA; else COMPLETED
            const finalStatus =
                scoreResult.overallClassification === AIOverallClassification.INSUFFICIENT_DATA
                    ? AIAnalysisStatus.INSUFFICIENT_DATA
                    : AIAnalysisStatus.COMPLETED;

            const savedAnalysis = await this.aiAnalysisRepository.save({
                issueId,
                status: finalStatus,
                cutoffDate,
                totalEligibleComments: eligibleDocs.length,
                supportCount: scoreResult.supportCount,
                challengeCount: scoreResult.challengeCount,
                neutralCount: scoreResult.neutralCount,
                score: scoreResult.score,
                overallClassification: scoreResult.overallClassification,
                summary: aiResult.summary,
                commentClassifications: aiResult.classifications,
                modelUsed: aiResult.modelUsed,
                completedAt: new Date(),
            });

            return IssueAIAnalysisAppMapper.toResponse(savedAnalysis, {
                canTriggerAnalysis: false,
                isEligibleForAnalysis: true,
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to analyze comments";
            logger.error({ issueId, error: message }, "JanAI analysis failed");

            const failedAnalysis = await this.aiAnalysisRepository.markFailed(issueId, message);
            if (failedAnalysis) {
                return IssueAIAnalysisAppMapper.toResponse(failedAnalysis, {
                    canTriggerAnalysis: true,
                    isEligibleForAnalysis: true,
                });
            }

            throw new ApiError(HttpStatusCode.INTERNAL_SERVER_ERROR, `JanAI processing failed: ${message}`);
        }
    }
}
export default AnalyzeIssueCommentsUseCase;