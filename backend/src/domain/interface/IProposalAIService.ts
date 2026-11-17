export interface ProposalAIComparisonItem {
    proposalId: string;
    providerId: string;
    providerName: string;
    providerType: string;
    memberCount?: number | undefined;
    estimatedTeamSize: number;
    estimatedDurationHours: number;
    totalBudgetRupees: number;
    budgetItems: Array<{ heading: string; amountRupees: number }>;
    executionRoadmap: Array<{ heading: string; description: string; startTime: string; endTime: string }>;
    ngoDetails?: {
        requiresFunding: boolean;
        participationMode: string;
        expectedParticipants?: number | undefined;
        requiresCommunityChat: boolean;
    } | undefined;
}

export interface IssueAIContext {
    id: string;
    title: string;
    description: string;
    categoryName?: string | undefined;
    locationAddress?: string | undefined;
}

export interface IssueProposalRecommendationResult {
    recommendedProposalId: string | null;
    recommendedProviderName: string | null;
    recommendationReason: string;
    keyStrengths: string[];
    keyConcerns: string[];
    tradeOffs: string[];
    modelUsed: string;
}

export interface IndividualProposalSummaryResult {
    executiveSummary: string;
    solutionApproach: string;
    workforceAndSchedule: string;
    budgetAssessment: string;
    keyStrengths: string[];
    potentialConcerns: string[];
    unclearOrMissingInformation: string[];
    modelUsed: string;
}

export interface IProposalAIService {
    generateIssueProposalRecommendation(
        issue: IssueAIContext,
        proposals: ProposalAIComparisonItem[]
    ): Promise<IssueProposalRecommendationResult>;

    generateIndividualProposalSummary(
        issue: IssueAIContext,
        proposal: ProposalAIComparisonItem
    ): Promise<IndividualProposalSummaryResult>;
}

