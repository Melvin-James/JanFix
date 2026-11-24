import type { AdminProposalAIRecommendationResponseDTO } from "../../../dto/admin/AdminProposalAIRecommendationResponseDTO.ts";

export interface IGetIssueProposalsRecommendationUseCase {
    execute(issueId: string, forceRefresh?: boolean): Promise<AdminProposalAIRecommendationResponseDTO>;
}

