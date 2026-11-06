import type { UpdateProposalDTO } from "../../../dto/proposal/SubmitProposalDTO.js";
import type { ProposalResponseDTO } from "../../../dto/proposal/ProposalResponseDTO.js";

export interface IUpdateProposalUseCase {
    execute(issueId: string, providerId: string, dto: UpdateProposalDTO, serverNow?: Date): Promise<ProposalResponseDTO>;
}
