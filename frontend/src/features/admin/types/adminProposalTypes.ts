import type { Issue, IssueLocation } from "../../issues/types/issue";
import type {
  Proposal,
  ProposalWindowStatus,
  ProviderProposalType,
  ProposalStatus,
} from "../../provider/types/proposalTypes";
import type { UploadedFile } from "../../provider/types/uploadedFile";
import type { ServiceProviderDetails } from "./ServiceProviderDetails";
import type { PaginationMeta } from "./Pagination";

export interface ProviderPreview {
  id: string;
  name: string;
  providerType?: string;
  avatarUrl?: string;
}

export interface AdminIssueProposalSummary {
  issueId: string;
  title: string;
  description: string;
  category: {
    id: string;
    name: string;
  } | null;
  location: IssueLocation;
  images: UploadedFile[];
  proposalCount: number;
  proposalWindowStatus?: ProposalWindowStatus;
  proposalDeadlineAt?: string;
  createdAt: string;
  latestProposalSubmittedAt?: string;
  providers: ProviderPreview[];
}

export type AdminProposalsSortOption =
  | "proposals_desc"
  | "proposals_asc"
  | "newest"
  | "oldest";

export interface GetAdminIssuesWithProposalsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  sortBy?: AdminProposalsSortOption;
}

export interface AdminIssuesWithProposalsResponse {
  success: boolean;
  message?: string;
  items: AdminIssueProposalSummary[];
  pagination: PaginationMeta;
}

export interface ProposalComparisonCard {
  id?: string;
  proposalId: string;
  issueId?: string;
  providerId: string;
  providerName: string;
  providerType: ProviderProposalType;
  providerAvatarUrl?: string | null;
  totalBudget: number; // in Rupees
  totalBudgetRupees?: number;
  totalBudgetPaise?: number;
  teamSize: number;
  estimatedTeamSize?: number;
  durationHours: number;
  estimatedDurationHours?: number;
  status: ProposalStatus | string;
  submittedAt: string;
  providerPhone?: string;
  providerAddress?: string;
  providerApplicationStatus?: string;
  providerMemberCount?: number;
  organizationName?: string;
  contactPhone?: string;
}

export interface AdminIssueProposalsComparisonResponse {
  issue: Issue;
  proposals: ProposalComparisonCard[];
  submittedProposalCount: number;
}

export interface AdminProposalDetailsResponse {
  proposal: Proposal;
  issue: Issue;
  provider: ServiceProviderDetails;
}

export interface SelectProposalResult {
  issueId: string;
  selectedProposalId: string;
  selectedProposalStatus: ProposalStatus;
  proposalSelectedAt: string;
  proposalWindowStatus: ProposalWindowStatus;
}

export interface AdminProposalAIRecommendation {
  issueId: string;
  recommendedProposalId: string | null;
  recommendedProviderName: string | null;
  recommendationReason: string;
  keyStrengths: string[];
  keyConcerns: string[];
  tradeOffs: string[];
  analyzedProposalCount: number;
  analyzedAt: string;
  cached: boolean;
}

export interface AdminProposalAISummary {
  proposalId: string;
  executiveSummary: string;
  solutionApproach: string;
  workforceAndScheduleAssessment: string;
  budgetAssessment: string;
  strengths: string[];
  potentialConcerns: string[];
  missingOrUnclearInfo: string[];
  analyzedAt: string;
  cached: boolean;
}

