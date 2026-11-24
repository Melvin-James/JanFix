import type { ProposalResponseDTO } from "../proposal/ProposalResponseDTO.ts";
import type { IssueResponseDTO } from "../issue/IssueResponseDTO.ts";
import type { ProviderType } from "../../../domain/enums/ProviderType.ts";
import type { ApplicationStatus } from "../../../domain/enums/ApplicationStatus.ts";

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

