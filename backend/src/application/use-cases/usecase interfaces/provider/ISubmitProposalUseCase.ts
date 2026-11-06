import type { SubmitProposalDTO } from "../../../dto/proposal/SubmitProposalDTO.js";
import type { ProposalResponseDTO } from "../../../dto/proposal/ProposalResponseDTO.js";

export interface ISubmitProposalUseCase {
    execute(issueId: string, providerId: string, dto: SubmitProposalDTO, serverNow?: Date): Promise<ProposalResponseDTO>;
}
