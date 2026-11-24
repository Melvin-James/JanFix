import type { ProviderApplicationResponseDTO } from "../../../dto/admin/ProviderApplicationResponseDTO.ts";
import type { PaginatedResult } from "../../../../shared/types/Pagination.ts";
import type { ProviderApplicationFilters } from "../../../../domain/interface/IUserRepository.ts";

export interface IGetProviderApplicationsUseCase {

    execute(
        page?: number,
        pageSize?: number,
        filters?: ProviderApplicationFilters
    ): Promise<PaginatedResult<ProviderApplicationResponseDTO>>;
    
}
