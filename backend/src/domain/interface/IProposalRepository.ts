import type { Proposal } from "../entities/Proposal.js";
import type { UploadedFile } from "../entities/UploadedFile.js";
import type { IssueLocation } from "../entities/IssueLocation.js";
import type { PaginatedResult } from "../../shared/types/Pagination.js";

export interface IssueWithProposalsFilters {
    search?: string | undefined;
    category?: string | undefined;
    sortBy?: "proposals_desc" | "proposals_asc" | "newest" | "oldest" | string | undefined;
}

export interface IssueWithProposalsAggregateItem {
    issue: {
        _id: string;
        title: string;
        description: string;
        category: {
            _id: string;
            name: string;
        } | null;
        location: IssueLocation;
        images: UploadedFile[];
        status: string;
        proposalWindowStatus?: string | undefined;
        proposalDeadlineAt?: Date | undefined;
        proposalOpenedAt?: Date | undefined;
        createdAt: Date;
        updatedAt: Date;
    };
    proposalCount: number;
    latestProposalSubmittedAt: Date;
    providers: Array<{
        _id: string;
        fullName: string;
        providerProfile?: {
            identity?: {
                providerName?: string | undefined;
                providerType?: string | undefined;
            } | undefined;
            documents?: {
                profileImage?: UploadedFile | undefined;
                logo?: UploadedFile | undefined;
            } | undefined;
        } | undefined;
    }>;
}

export interface IProposalRepository {
    create(proposal: Omit<Proposal, "id" | "createdAt" | "updatedAt">): Promise<Proposal>;
    findById(id: string): Promise<Proposal | null>;
    findByIssueAndProvider(issueId: string, providerId: string): Promise<Proposal | null>;
    findByIdAndIssueId(id: string, issueId: string): Promise<Proposal | null>;
    findSubmittedByIssueId(issueId: string): Promise<Proposal[]>;
    findIssuesWithProposals(
        page: number,
        pageSize: number,
        filters?: IssueWithProposalsFilters
    ): Promise<PaginatedResult<IssueWithProposalsAggregateItem>>;
    update(id: string, updates: Partial<Proposal>): Promise<Proposal | null>;
    updateByIssueAndProvider(issueId: string, providerId: string, updates: Partial<Proposal>): Promise<Proposal | null>;
    countSubmittedByIssue(issueId: string): Promise<number>;
    countSubmittedForIssues(issueIds: string[]): Promise<Map<string, number>>;
    findSubmittedIssueIdsByProvider(providerId: string, issueIds: string[]): Promise<string[]>;
}

