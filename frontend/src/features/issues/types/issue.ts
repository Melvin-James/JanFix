import type { UploadedFile } from "../../provider/types/uploadedFile";

export type IssueVisibility = "PUBLIC" | "PRIVATE";

export type IssueStatus =
  | "REPORTED"
  | "VERIFIED"
  | "REJECTED"
  | "FUNDRAISING"
  | "PLANNED"
  | "ONGOING"
  | "COMPLETED";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface IssueLocation {
  address: string;
  coordinates: Coordinates;
  locality?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

export interface IssueFundingSnapshot {
  fundingType: "COMMUNITY_FUNDING" | "NGO_OWN_FUNDING";
  providerBudgetPaise: number;
  providerBudgetRupees: number;
  platformFeeRatePercent: number;
  platformFeePaise: number;
  platformFeeRupees: number;
  fundingTargetPaise: number;
  fundingTargetRupees: number;
  amountRaisedPaise: number;
  amountRaisedRupees: number;
  selectedProposalId: string;
  selectedAt: string;
}

export interface PublicSelectedProposal {
  id: string;
  estimatedTeamSize: number;
  estimatedDurationHours: number;
  fundingType: "COMMUNITY_FUNDING" | "NGO_OWN_FUNDING";
  budgetItems: {
    id?: string;
    heading: string;
    amountPaise: number;
    amountRupees: number;
  }[];
  totalBudgetPaise: number;
  totalBudgetRupees: number;
  executionRoadmap: {
    id?: string;
    heading: string;
    description: string;
    startTime: string;
    endTime: string;
    order: number;
  }[];
  ngoDetails?: {
    requiresFunding: boolean;
    participationMode: string;
    expectedParticipants?: number;
    requiresCommunityChat: boolean;
  };
  submittedAt: string;
}

export interface PublicProviderProfile {
  id: string;
  fullName: string;
  providerType: string;
  organizationName?: string;
  bio?: string;
  profileImage?: string;
  logo?: string;
  teamSize?: number;
  communityPhotos?: string[];
}

export interface IssueTimelineEvent {
  status: IssueStatus;
  title: string;
  description: string;
  timestamp?: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface Issue {
  id: string;
  createdBy: string;
  reporterName?: string;
  title: string;
  description: string;
  category: string;
  categoryName?: string;
  images: UploadedFile[];
  visibility: IssueVisibility;
  location: IssueLocation;
  status: IssueStatus;
  rejectionReason?: string;
  proposalOpenedAt?: string;
  proposalDeadlineAt?: string;
  proposalWindowStatus?: "OPEN" | "CLOSED" | "CANCELLED";
  selectedProposalId?: string;
  proposalSelectedAt?: string;
  fundingSnapshot?: IssueFundingSnapshot;
  selectedProposal?: PublicSelectedProposal;
  selectedProvider?: PublicProviderProfile;
  timelineEvents?: IssueTimelineEvent[];
  isCommunityIssue?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateIssuePayload {
  title: string;
  description: string;
  categoryId: string;
  images: UploadedFile[];
  visibility: IssueVisibility;
  location: IssueLocation;
}

export interface CreateIssueResponse {
  success: boolean;
  message: string;
  issue: Issue;
}

export interface IssueDetailsResponse {
  success: boolean;
  issue: Issue;
}

export interface UserIssuesResponse {
  success: boolean;
  issues: Issue[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface FeedIssuesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  status?: string;
  visibility?: string;
  isCommunityIssue?: boolean;
}

export interface FeedIssuesResponse {
  success: boolean;
  issues: Issue[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface UpvoteStateResponse {
  success: boolean;
  message?: string;
  hasUpvoted: boolean;
  upvoteCount: number;
}

export interface CommentAuthor {
  id: string;
  fullName: string;
}

export interface IssueComment {
  id: string;
  issueId: string;
  body: string;
  author: CommentAuthor;
  createdAt: string;
  updatedAt: string;
}

export interface IssueCommentsResponse {
  success: boolean;
  comments: IssueComment[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface CreateCommentPayload {
  body: string;
}

export interface CreateCommentResponse {
  success: boolean;
  message: string;
  comment: IssueComment;
}

export interface IssueFilters {
  page?: number;
  pageSize?: number;
  category?: string;
  visibility?: IssueVisibility | "ALL";
  status?: IssueStatus | "ALL";
  search?: string;
}
