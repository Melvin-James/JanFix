export type ProviderProposalType = "INDIVIDUAL" | "VOLUNTEER_GROUP" | "NGO";
export type ProposalStatus = "SUBMITTED" | "WITHDRAWN";
export type ProposalWindowStatus = "OPEN" | "CLOSED" | "CANCELLED";
export type NgoParticipationMode = "TEAM_ONLY" | "OPEN_COMMUNITY";

export interface BudgetItem {
  id?: string;
  heading: string;
  amountPaise: number;
  amountRupees?: number;
}

export interface ExecutionRoadmapItem {
  id?: string;
  heading: string;
  description: string;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  order: number;
}

export interface ProposalNgoDetails {
  requiresFunding: boolean;
  participationMode: NgoParticipationMode;
  expectedParticipants?: number;
  requiresCommunityChat: boolean;
}

export interface ProposalIssueSnapshot {
  title: string;
  description: string;
}

export interface Proposal {
  id: string;
  issueId: string;
  providerId: string;
  providerType: ProviderProposalType;
  status: ProposalStatus;
  issueSnapshot: ProposalIssueSnapshot;
  estimatedTeamSize: number;
  estimatedDurationHours: number;
  expectedStartDate: string;
  budgetItems: BudgetItem[];
  totalBudgetPaise: number;
  totalBudgetRupees: number;
  executionRoadmap: ExecutionRoadmapItem[];
  ngoDetails?: ProposalNgoDetails;
  submittedAt: string;
  withdrawnAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubmitProposalPayload {
  estimatedTeamSize: number;
  estimatedDurationHours: number;
  expectedStartDate: string;
  budgetItems: {
    heading: string;
    amountRupees?: number;
    amountPaise?: number;
  }[];
  executionRoadmap: {
    heading: string;
    description: string;
    startTime: string;
    endTime: string;
    order?: number;
  }[];
  ngoDetails?: {
    requiresFunding: boolean;
    participationMode: NgoParticipationMode;
    expectedParticipants?: number;
    requiresCommunityChat: boolean;
  };
}

export type UpdateProposalPayload = Partial<SubmitProposalPayload>;

export interface ProposalResponse {
  success: boolean;
  message?: string;
  proposal: Proposal;
}

export interface GetProposalResponse {
  success: boolean;
  proposal: Proposal | null;
}

export interface WithdrawProposalResponse {
  success: boolean;
  message: string;
}

