import type { IssueResponseDTO } from "../issue/IssueResponseDTO.js";

export interface ProviderIssueResponseDTO extends IssueResponseDTO {
    hasExpressedInterest: boolean;
}
