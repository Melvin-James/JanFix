import type { ProposalStatus } from "../enums/ProposalStatus.js";
import type { ProposalWindowStatus } from "../enums/ProposalWindowStatus.js";
import type { IssueStatus } from "../enums/IssueStatus.js";
import type { IssueFundingSnapshot } from "../entities/Issue.js";

export type ProposalSelectionFailureReason =
    | "INVALID_ID"
    | "ISSUE_NOT_FOUND"
    | "ISSUE_NOT_VERIFIED"
    | "MISSING_DEADLINE"
    | "DEADLINE_NOT_PASSED"
    | "WINDOW_CANCELLED"
    | "ALREADY_SELECTED"
    | "PROPOSAL_NOT_FOUND"
    | "PROPOSAL_NOT_MATCH_ISSUE"
    | "PROPOSAL_NOT_SUBMITTED"
    | "CONCURRENT_CONFLICT"
    | "INVALID_FUNDING_TYPE"

export class ProposalSelectionError extends Error {
    constructor(
        public readonly reason: ProposalSelectionFailureReason,
        message: string
    ) {
        super(message);
        this.name = "ProposalSelectionError";
    }
}

export interface ProposalSelectionResult {
    issueId: string;
    issueStatus: IssueStatus;
    selectedProposalId: string;
    selectedProposalStatus: ProposalStatus;
    proposalSelectedAt: Date;
    proposalWindowStatus: ProposalWindowStatus;
    fundingSnapshot?: IssueFundingSnapshot | undefined;
}

export interface IProposalSelectionRepository {
    selectProposalAtomic(
        issueId: string,
        proposalId: string,
        serverNow: Date
    ): Promise<ProposalSelectionResult>;
}

