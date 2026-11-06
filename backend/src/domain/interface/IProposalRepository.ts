import type { Proposal } from "../entities/Proposal.js";

export interface IProposalRepository {
    create(proposal: Omit<Proposal, "id" | "createdAt" | "updatedAt">): Promise<Proposal>;
    findById(id: string): Promise<Proposal | null>;
    findByIssueAndProvider(issueId: string, providerId: string): Promise<Proposal | null>;
    update(id: string, updates: Partial<Proposal>): Promise<Proposal | null>;
    updateByIssueAndProvider(issueId: string, providerId: string, updates: Partial<Proposal>): Promise<Proposal | null>;
    countSubmittedByIssue(issueId: string): Promise<number>;
    countSubmittedForIssues(issueIds: string[]): Promise<Map<string, number>>;
    findSubmittedIssueIdsByProvider(providerId: string, issueIds: string[]): Promise<string[]>;
}

