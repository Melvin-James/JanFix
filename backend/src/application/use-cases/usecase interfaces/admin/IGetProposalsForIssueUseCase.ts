import type { AdminIssueProposalsComparisonResponseDTO } from "../../../dto/admin/AdminIssueProposalsComparisonResponseDTO.ts";

export interface IGetProposalsForIssueUseCase {
    execute(issueId: string): Promise<AdminIssueProposalsComparisonResponseDTO>;
}

