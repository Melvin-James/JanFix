import type { ProviderType } from "../../../domain/enums/ProviderType.ts";
import type { ProposalStatus } from "../../../domain/enums/ProposalStatus.ts";
import type { NgoParticipationMode } from "../../../domain/enums/NgoParticipationMode.ts";
import type { ProposalFundingType } from "../../../domain/enums/ProposalFundingType.ts";

export interface BudgetItemDTO {
    id?: string | undefined;
    heading: string;
    amountPaise: number;
    amountRupees?: number | undefined;
}

export interface ExecutionRoadmapItemDTO {
    id?: string | undefined;
    heading: string;
    description: string;
    startTime: string;
    endTime: string;
    order: number;
}

export interface ProposalNgoDetailsDTO {
    requiresFunding: boolean;
    participationMode: NgoParticipationMode;
    expectedParticipants?: number | undefined;
    requiresCommunityChat: boolean;
}

export interface ProposalIssueSnapshotDTO {
    title: string;
    description: string;
}

export interface ProposalResponseDTO {
    id: string;
    issueId: string;
    providerId: string;
    providerType: ProviderType;
    status: ProposalStatus;
    fundingType?: ProposalFundingType | undefined;
    issueSnapshot: ProposalIssueSnapshotDTO;
    estimatedTeamSize: number;
    teamSize?: number | undefined;
    estimatedDurationHours: number;
    durationHours?: number | undefined;
    budgetItems: BudgetItemDTO[];
    totalBudgetPaise: number;
    totalBudgetRupees: number;
    totalBudget?: number | undefined;
    executionRoadmap: ExecutionRoadmapItemDTO[];
    ngoDetails?: ProposalNgoDetailsDTO | undefined;
    submittedAt: string; // ISO date string
    withdrawnAt?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
}

