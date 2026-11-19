import type { ProposalStatus } from "../../../domain/enums/ProposalStatus.js";
import type { ProposalWindowStatus } from "../../../domain/enums/ProposalWindowStatus.js";

export interface SelectProposalResponseDTO {
    issueId: string;
    selectedProposalId: string;
    selectedProposalStatus: ProposalStatus;
    proposalSelectedAt: string;
    proposalWindowStatus: ProposalWindowStatus;
}

