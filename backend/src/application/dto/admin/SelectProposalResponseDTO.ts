import type { ProposalStatus } from "../../../domain/enums/ProposalStatus.ts";
import type { ProposalWindowStatus } from "../../../domain/enums/ProposalWindowStatus.ts";
import type { IssueStatus } from "../../../domain/enums/IssueStatus.ts";
import type { IssueFundingSnapshotDTO } from "../issue/IssueResponseDTO.ts";

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

