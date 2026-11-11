import type { ProviderType } from "../enums/ProviderType.js";
import type { ProposalStatus } from "../enums/ProposalStatus.js";
import type { NgoParticipationMode } from "../enums/NgoParticipationMode.js";

export interface BudgetItem {
    id?: string | undefined;
    heading: string;
    amountPaise: number;
}

export interface ExecutionRoadmapItem {
    id?: string | undefined;
    heading: string;
    description: string;
    startTime: string; // "HH:mm" e.g. "08:00"
    endTime: string;   // "HH:mm" e.g. "09:00"
    order: number;
}

export interface ProposalNgoDetails {
    requiresFunding: boolean;
    participationMode: NgoParticipationMode;
    expectedParticipants?: number | undefined;
    requiresCommunityChat: boolean;
}

export interface ProposalIssueSnapshot {
    title: string;
    description: string;
}

export interface Proposal {
    id?: string | undefined;
    issueId: string;
    providerId: string;
    providerType: ProviderType;
    status: ProposalStatus;
    issueSnapshot: ProposalIssueSnapshot;
    estimatedTeamSize: number;
    estimatedDurationHours: number;
    budgetItems: BudgetItem[];
    totalBudgetPaise: number;
    executionRoadmap: ExecutionRoadmapItem[];
    ngoDetails?: ProposalNgoDetails | undefined;
    submittedAt: Date;
    withdrawnAt?: Date | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
}
