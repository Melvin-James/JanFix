import type { NgoParticipationMode } from "../../../domain/enums/NgoParticipationMode.js";
import type { ProposalFundingType } from "../../../domain/enums/ProposalFundingType.js";

export interface BudgetItemInputDTO {
    heading: string;
    amountRupees?: number;
    amountPaise?: number;
}

export interface ExecutionRoadmapItemInputDTO {
    heading: string;
    description: string;
    startTime: string; // "HH:mm"
    endTime: string;   // "HH:mm"
    order?: number;
}

export interface ProposalNgoDetailsInputDTO {
    requiresFunding: boolean;
    participationMode: NgoParticipationMode;
    expectedParticipants?: number;
    requiresCommunityChat: boolean;
}

export interface SubmitProposalDTO {
    fundingType?: ProposalFundingType;
    estimatedTeamSize: number;
    estimatedDurationHours: number;
    budgetItems: BudgetItemInputDTO[];
    executionRoadmap: ExecutionRoadmapItemInputDTO[];
    ngoDetails?: ProposalNgoDetailsInputDTO;
}

export type UpdateProposalDTO = Partial<SubmitProposalDTO>;

