import type { PaginatedResult } from "../../../../shared/types/Pagination.ts";
import type { AdminIssueProposalSummaryDTO } from "../../../dto/admin/AdminIssueProposalSummaryDTO.ts";
import type { IssueWithProposalsFilters } from "../../../../domain/interface/IProposalRepository.ts";

export interface IGetIssuesWithProposalsUseCase {
    execute(
        page?: number,
        pageSize?: number,
        filters?: IssueWithProposalsFilters
    ): Promise<PaginatedResult<AdminIssueProposalSummaryDTO>>;
}

