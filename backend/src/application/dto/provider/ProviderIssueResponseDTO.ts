import type { IssueResponseDTO } from "../issue/IssueResponseDTO.ts";

export interface ProviderIssueResponseDTO extends IssueResponseDTO {
    hasSubmittedProposal: boolean;
    proposalCount: number;
    // Preserved backward compatibility alias during migration
    hasExpressedInterest?: boolean;
}
