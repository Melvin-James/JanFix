import type { ProviderType } from "../../../domain/enums/ProviderType.js";
import type { ProposalStatus } from "../../../domain/enums/ProposalStatus.js";
import type { NgoParticipationMode } from "../../../domain/enums/NgoParticipationMode.js";

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
    issueSnapshot: ProposalIssueSnapshotDTO;
    estimatedTeamSize: number;
    estimatedDurationHours: number;
    expectedStartDate: string; // ISO date string
    budgetItems: BudgetItemDTO[];
    totalBudgetPaise: number;
    totalBudgetRupees: number;
    executionRoadmap: ExecutionRoadmapItemDTO[];
    ngoDetails?: ProposalNgoDetailsDTO | undefined;
    submittedAt: string; // ISO date string
    withdrawnAt?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
}

