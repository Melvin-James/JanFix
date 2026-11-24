import type { ServiceProviderResponseDTO } from "../../../dto/admin/ServiceProviderResponseDTO.ts";
import type { PaginatedResult } from "../../../../shared/types/Pagination.ts";
import type { ServiceProviderFilters } from "../../../../domain/interface/IUserRepository.ts";

export interface IGetServiceProvidersUseCase {
    
    execute(
        page?: number,
        pageSize?: number,
        filters?: ServiceProviderFilters
    ): Promise<PaginatedResult<ServiceProviderResponseDTO>>;

}