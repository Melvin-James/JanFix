import type { UploadedFile } from "./UploadedFile.ts";
import type { IssueLocation } from "./IssueLocation.ts";
import type { IssueVisibility } from "../enums/IssueVisibility.ts";
import type { IssueStatus } from "../enums/IssueStatus.ts";
import type { ProposalWindowStatus } from "../enums/ProposalWindowStatus.ts";
import type { ProposalFundingType } from "../enums/ProposalFundingType.ts";

export interface IssueFundingSnapshot {
    fundingType: ProposalFundingType;
    providerBudgetPaise: number;
    platformFeeRatePercent: number;
    platformFeePaise: number;
    fundingTargetPaise: number;
    amountRaisedPaise: number;
    selectedProposalId: string;
    selectedAt: Date;
}

export interface Issue {
    id?: string;
    createdBy: string;
    reporterName?: string | undefined;
    title: string;
    description: string;
    category: string; // Category ID
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
    fundingSnapshot?: IssueFundingSnapshot | undefined;
    isCommunityIssue?: boolean | undefined;
    createdAt?: Date;
    updatedAt?: Date;
}
