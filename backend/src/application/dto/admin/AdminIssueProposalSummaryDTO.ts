import type { UploadedFile } from "../../../domain/entities/UploadedFile.ts";
import type { IssueLocation } from "../../../domain/entities/IssueLocation.ts";
import type { ProposalWindowStatus } from "../../../domain/enums/ProposalWindowStatus.ts";

export interface ProviderPreviewDTO {
    id: string;
    name: string;
    providerType?: string | undefined;
    avatarUrl?: string | undefined;
}

export interface AdminIssueProposalSummaryDTO {
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
    proposalWindowStatus?: ProposalWindowStatus | undefined;
    proposalDeadlineAt?: string | undefined;
    createdAt: string;
    latestProposalSubmittedAt?: string | undefined;
    providers: ProviderPreviewDTO[];
}

