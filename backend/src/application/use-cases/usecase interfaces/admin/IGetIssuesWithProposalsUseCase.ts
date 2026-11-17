import type { PaginatedResult } from "../../../../shared/types/Pagination.js";
import type { AdminIssueProposalSummaryDTO } from "../../../dto/admin/AdminIssueProposalSummaryDTO.js";
import type { IssueWithProposalsFilters } from "../../../../domain/interface/IProposalRepository.js";

export interface IGetIssuesWithProposalsUseCase {
    execute(
        page?: number,
        pageSize?: number,
        filters?: IssueWithProposalsFilters
    ): Promise<PaginatedResult<AdminIssueProposalSummaryDTO>>;
}

