import type { ProposalResponseDTO } from "../../../dto/proposal/ProposalResponseDTO.ts";

export interface IGetProviderProposalUseCase {
    execute(issueId: string, providerId: string): Promise<ProposalResponseDTO | null>;
}
