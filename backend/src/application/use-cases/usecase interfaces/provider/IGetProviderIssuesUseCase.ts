import type { PaginatedResult } from "../../../../shared/types/Pagination.js";
import type { ProviderIssueResponseDTO } from "../../../dto/provider/ProviderIssueResponseDTO.js";

export interface ProviderIssueFilters {
    category?: string | undefined;
    search?: string | undefined;
}

export interface IGetProviderIssuesUseCase {
    execute(
        providerId: string,
        page?: number,
        pageSize?: number,
        filters?: ProviderIssueFilters
    ): Promise<PaginatedResult<ProviderIssueResponseDTO>>;
}
