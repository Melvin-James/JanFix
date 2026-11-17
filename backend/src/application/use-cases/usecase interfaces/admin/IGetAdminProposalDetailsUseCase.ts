import type { AdminProposalDetailsResponseDTO } from "../../../dto/admin/AdminProposalDetailsResponseDTO.js";

export interface IGetAdminProposalDetailsUseCase {
    execute(issueId: string, proposalId: string): Promise<AdminProposalDetailsResponseDTO>;
}

