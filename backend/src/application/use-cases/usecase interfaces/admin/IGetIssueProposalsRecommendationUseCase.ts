import type { AdminProposalAIRecommendationResponseDTO } from "../../../dto/admin/AdminProposalAIRecommendationResponseDTO.js";

export interface IGetIssueProposalsRecommendationUseCase {
    execute(issueId: string, forceRefresh?: boolean): Promise<AdminProposalAIRecommendationResponseDTO>;
}

