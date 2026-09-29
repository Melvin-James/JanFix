import type { ProviderApplicationResponseDTO } from "../../dto/admin/ProviderApplicationResponseDTO.js";
import type { PaginatedResult } from "../../../shared/types/Pagination.js";
import type { ProviderApplicationFilters } from "../../../domain/interface/IUserRepository.js";

export interface IGetProviderApplicationsUseCase {

    execute(
        page?: number,
        pageSize?: number,
        filters?: ProviderApplicationFilters
    ): Promise<PaginatedResult<ProviderApplicationResponseDTO>>;
    
}