export interface AdminProposalAISummaryResponseDTO {
    proposalId: string;
    issueId: string;
    executiveSummary: string;
    solutionApproach: string;
    workforceAndSchedule: string;
    budgetAssessment: string;
    keyStrengths: string[];
    potentialConcerns: string[];
    unclearOrMissingInformation: string[];
    modelUsed: string;
    completedAt: string;
}

