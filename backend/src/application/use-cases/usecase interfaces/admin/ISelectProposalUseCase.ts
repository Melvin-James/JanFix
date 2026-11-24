import type { SelectProposalResponseDTO } from "../../../dto/admin/SelectProposalResponseDTO.ts";

export interface ISelectProposalUseCase {
    execute(issueId: string, proposalId: string, serverNow?: Date): Promise<SelectProposalResponseDTO>;
}

