import type { AdminProposalDetailsResponseDTO } from "../../../dto/admin/AdminProposalDetailsResponseDTO.ts";

export interface IGetAdminProposalDetailsUseCase {
    execute(issueId: string, proposalId: string): Promise<AdminProposalDetailsResponseDTO>;
}

