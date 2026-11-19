import type { SelectProposalResponseDTO } from "../../../dto/admin/SelectProposalResponseDTO.js";

export interface ISelectProposalUseCase {
    execute(issueId: string, proposalId: string, serverNow?: Date): Promise<SelectProposalResponseDTO>;
}

