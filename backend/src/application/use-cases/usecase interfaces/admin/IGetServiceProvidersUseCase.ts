import type { ServiceProviderResponseDTO } from "../../../dto/admin/ServiceProviderResponseDTO.js";
import type { PaginatedResult } from "../../../../shared/types/Pagination.js";
import type { ServiceProviderFilters } from "../../../../domain/interface/IUserRepository.js";

export interface IGetServiceProvidersUseCase {
    
    execute(
        page?: number,
        pageSize?: number,
        filters?: ServiceProviderFilters
    ): Promise<PaginatedResult<ServiceProviderResponseDTO>>;

}