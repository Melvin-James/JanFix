import type { AdminProposalAISummaryResponseDTO } from "../../../dto/admin/AdminProposalAISummaryResponseDTO.ts";

export interface IGetProposalAISummaryUseCase {
    execute(issueId: string, proposalId: string, forceRefresh?: boolean): Promise<AdminProposalAISummaryResponseDTO>;
}

