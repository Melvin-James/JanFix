import { Types } from "mongoose";
import type { IGetIssueAIAnalysisUseCase } from "../usecase interfaces/admin/IGetIssueAIAnalysisUseCase.js";
import type { IAnalyzeIssueCommentsUseCase } from "../usecase interfaces/admin/IAnalyzeIssueCommentsUseCase.js";
import type { IIssueRepository } from "../../../domain/interface/IIssueRepository.js";
import type { IIssueAIAnalysisRepository } from "../../../domain/interface/IIssueAIAnalysisRepository.js";
import type { IssueAIAnalysisResponseDTO } from "../../dto/admin/IssueAIAnalysisResponseDTO.js";
import { IssueAIAnalysisAppMapper } from "../../mappers/IssueAIAnalysisAppMapper.js";
import { isIssueEligibleForReview, getIssueInteractionDeadline } from "../../../shared/utils/issueEligibility.js";
import { AIAnalysisStatus } from "../../../domain/enums/AIAnalysisStatus.js";
import { AIOverallClassification } from "../../../domain/enums/AIOverallClassification.js";
import ApiError from "../../../shared/utils/apiError.js";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

export class GetIssueAIAnalysisUseCase implements IGetIssueAIAnalysisUseCase {
    constructor(
        private readonly issueRepository: IIssueRepository,
        private readonly aiAnalysisRepository: IIssueAIAnalysisRepository,
        private readonly analyzeIssueCommentsUseCase: IAnalyzeIssueCommentsUseCase
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

        // Scenario 1: Issue has not completed its 24-hour interaction period
        if (!isEligible) {
            return {
                issueId,
                status: AIAnalysisStatus.PENDING,
                cutoffDate: cutoffDate.toISOString(),
                totalEligibleComments: 0,
                supportCount: 0,
                challengeCount: 0,
                neutralCount: 0,
                score: null,
                overallClassification: AIOverallClassification.INSUFFICIENT_DATA,
                summary: "Community interaction period is ongoing (24 hours). AI analysis will become available once the interaction period closes.",
                commentClassifications: [],
                canTriggerAnalysis: false,
                isEligibleForAnalysis: false,
            };
        }

        // Scenario 2: Existing analysis already recorded
        const existing = await this.aiAnalysisRepository.findByIssueId(issueId);
        if (existing) {
            return IssueAIAnalysisAppMapper.toResponse(existing, {
                canTriggerAnalysis: existing.status === AIAnalysisStatus.FAILED,
                isEligibleForAnalysis: true,
            });
        }

        // Scenario 3: Eligible issue has not been analyzed yet -> trigger automatic first-time analysis
        return await this.analyzeIssueCommentsUseCase.execute(issueId, serverNow);
    }
}
export default GetIssueAIAnalysisUseCase;
