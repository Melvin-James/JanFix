import type { ProposalResponseDTO } from "../proposal/ProposalResponseDTO.ts";
import type { IssueResponseDTO } from "../issue/IssueResponseDTO.ts";
import type { ServiceProviderDetailsResponseDTO } from "./ServiceProviderDetailsResponseDTO.ts";

export interface AdminProposalDetailsResponseDTO {
    proposal: ProposalResponseDTO;
    issue: IssueResponseDTO;
    provider: ServiceProviderDetailsResponseDTO;
}

