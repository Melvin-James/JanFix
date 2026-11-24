import type { SubmitProposalDTO } from "../../../dto/proposal/SubmitProposalDTO.ts";
import type { ProposalResponseDTO } from "../../../dto/proposal/ProposalResponseDTO.ts";

export interface ISubmitProposalUseCase {
    execute(issueId: string, providerId: string, dto: SubmitProposalDTO, serverNow?: Date): Promise<ProposalResponseDTO>;
}
