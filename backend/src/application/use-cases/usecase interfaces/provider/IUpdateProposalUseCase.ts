import type { UpdateProposalDTO } from "../../../dto/proposal/SubmitProposalDTO.ts";
import type { ProposalResponseDTO } from "../../../dto/proposal/ProposalResponseDTO.ts";

export interface IUpdateProposalUseCase {
    execute(issueId: string, providerId: string, dto: UpdateProposalDTO, serverNow?: Date): Promise<ProposalResponseDTO>;
}
