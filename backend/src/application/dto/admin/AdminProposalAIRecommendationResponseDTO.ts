export interface AdminProposalAIRecommendationResponseDTO {
    issueId: string;
    recommendedProposalId: string | null;
    recommendedProviderName: string | null;
    recommendationReason: string;
    keyStrengths: string[];
    keyConcerns: string[];
    tradeOffs: string[];
    proposalsAnalyzedCount: number;
    modelUsed: string;
    completedAt: string;
}

