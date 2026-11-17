import type { ProposalResponseDTO } from "../proposal/ProposalResponseDTO.js";
import type { IssueResponseDTO } from "../issue/IssueResponseDTO.js";
import type { ProviderType } from "../../../domain/enums/ProviderType.js";
import type { ApplicationStatus } from "../../../domain/enums/ApplicationStatus.js";

export interface ProposalComparisonCardDTO extends ProposalResponseDTO {
    proposalId: string;
    providerName: string;
    providerType: ProviderType;
    providerAvatarUrl?: string | undefined;
    providerPhone?: string | undefined;
    providerAddress?: string | undefined;
    providerApplicationStatus?: ApplicationStatus | undefined;
    providerMemberCount?: number | undefined;
    durationHours: number;
    teamSize: number;
    totalBudget: number;
}

export interface AdminIssueProposalsComparisonResponseDTO {
    issue: IssueResponseDTO;
    proposals: ProposalComparisonCardDTO[];
    proposalCount: number;
}

