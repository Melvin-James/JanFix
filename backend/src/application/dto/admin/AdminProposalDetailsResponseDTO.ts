import type { ProposalResponseDTO } from "../proposal/ProposalResponseDTO.js";
import type { IssueResponseDTO } from "../issue/IssueResponseDTO.js";
import type { ServiceProviderDetailsResponseDTO } from "./ServiceProviderDetailsResponseDTO.js";

export interface AdminProposalDetailsResponseDTO {
    proposal: ProposalResponseDTO;
    issue: IssueResponseDTO;
    provider: ServiceProviderDetailsResponseDTO;
}

