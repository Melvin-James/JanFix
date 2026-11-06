import type { ProposalResponseDTO } from "../../../dto/proposal/ProposalResponseDTO.js";

export interface IGetProviderProposalUseCase {
    execute(issueId: string, providerId: string): Promise<ProposalResponseDTO | null>;
}
