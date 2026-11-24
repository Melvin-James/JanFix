import type { PaginatedResult } from "../../../../shared/types/Pagination.ts";
import type { ProviderIssueResponseDTO } from "../../../dto/provider/ProviderIssueResponseDTO.ts";

export interface ProviderIssueFilters {
    category?: string | undefined;
    search?: string | undefined;
    visibility?: string | undefined;
}

export interface IGetProviderIssuesUseCase {
    execute(
        providerId: string,
        page?: number,
        pageSize?: number,
        filters?: ProviderIssueFilters
    ): Promise<PaginatedResult<ProviderIssueResponseDTO>>;
}
