import type { ProposalStatus } from "../../../domain/enums/ProposalStatus.js";
import type { ProposalWindowStatus } from "../../../domain/enums/ProposalWindowStatus.js";
import type { IssueStatus } from "../../../domain/enums/IssueStatus.js";
import type { IssueFundingSnapshotDTO } from "../issue/IssueResponseDTO.js";

export interface SelectProposalResponseDTO {
    issueId: string;
    issueStatus: IssueStatus;
    selectedProposalId: string;
    selectedProposalStatus: ProposalStatus;
    proposalSelectedAt: string;
    proposalWindowStatus: ProposalWindowStatus;
    fundingSnapshot?: IssueFundingSnapshotDTO | undefined;
    isCommunityIssue?: boolean | undefined;
}

