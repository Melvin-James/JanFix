import type { UploadedFile } from "../../../domain/entities/UploadedFile.js";
import type { IssueLocation } from "../../../domain/entities/IssueLocation.js";
import type { IssueVisibility } from "../../../domain/enums/IssueVisibility.js";
import type { IssueStatus } from "../../../domain/enums/IssueStatus.js";
import type { ProposalWindowStatus } from "../../../domain/enums/ProposalWindowStatus.js";
import type { ProposalFundingType } from "../../../domain/enums/ProposalFundingType.js";

export interface IssueFundingSnapshotDTO {
    fundingType: ProposalFundingType;
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

export interface PublicSelectedProposalDTO {
    id?: string | undefined;
    estimatedTeamSize: number;
    estimatedDurationHours: number;
    fundingType: ProposalFundingType;
    budgetItems: {
        id?: string | undefined;
        heading: string;
        amountPaise: number;
        amountRupees: number;
    }[];
    totalBudgetPaise: number;
    totalBudgetRupees: number;
    executionRoadmap: {
        id?: string | undefined;
        heading: string;
        description: string;
        startTime: string;
        endTime: string;
        order: number;
    }[];
    ngoDetails?: {
        requiresFunding: boolean;
        participationMode: string;
        expectedParticipants?: number | undefined;
        requiresCommunityChat: boolean;
    } | undefined;
    submittedAt: string;
}

export interface PublicProviderProfileDTO {
    id: string;
    fullName: string;
    providerType: string;
    organizationName?: string | undefined;
    bio?: string | undefined;
    profileImage?: string | undefined;
    logo?: string | undefined;
    teamSize?: number | undefined;
    communityPhotos?: string[] | undefined;
}

export interface IssueTimelineEventDTO {
    status: IssueStatus;
    title: string;
    description: string;
    timestamp?: string | undefined;
    isCompleted: boolean;
    isCurrent: boolean;
}

export interface IssueResponseDTO {
    id: string;
    createdBy: string;
    reporterName?: string | undefined;
    title: string;
    description: string;
    category: string;
    categoryName?: string | undefined;
    images: UploadedFile[];
    visibility: IssueVisibility;
    location: IssueLocation;
    status: IssueStatus;
    rejectionReason?: string | undefined;
    proposalOpenedAt?: Date | undefined;
    proposalDeadlineAt?: Date | undefined;
    proposalWindowStatus?: ProposalWindowStatus | undefined;
    selectedProposalId?: string | undefined;
    proposalSelectedAt?: Date | undefined;
    fundingSnapshot?: IssueFundingSnapshotDTO | undefined;
    selectedProposal?: PublicSelectedProposalDTO | undefined;
    selectedProvider?: PublicProviderProfileDTO | undefined;
    timelineEvents?: IssueTimelineEventDTO[] | undefined;
    isCommunityIssue?: boolean | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
}
