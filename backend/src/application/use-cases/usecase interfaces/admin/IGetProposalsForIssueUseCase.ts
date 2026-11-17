import type { AdminIssueProposalsComparisonResponseDTO } from "../../../dto/admin/AdminIssueProposalsComparisonResponseDTO.js";

export interface IGetProposalsForIssueUseCase {
    execute(issueId: string): Promise<AdminIssueProposalsComparisonResponseDTO>;
}

