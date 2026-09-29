import type { IUserRepository, ProviderApplicationFilters } from "../../../domain/interface/IUserRepository.js";

import type { IGetProviderApplicationsUseCase } from "../usecase interfaces/IGetProviderApplicationsUseCase.js";

import type { ProviderApplicationResponseDTO } from "../../dto/admin/ProviderApplicationResponseDTO.js";

import { ProviderApplicationMapper } from "../../mappers/ProviderApplicationMapper.js";
import type { PaginatedResult } from "../../../shared/types/Pagination.js";

export class GetProviderApplicationsUseCase implements IGetProviderApplicationsUseCase {
    constructor(
        private userRepository: IUserRepository
    ) {}

    async execute(
        page = 1,
        pageSize = 10,
        filters?: ProviderApplicationFilters
    ): Promise<PaginatedResult<ProviderApplicationResponseDTO>> {
        
        const paginatedResult = await this.userRepository.findPaginatedProviderApplications(
            page,
            pageSize,
            filters
        );

        return {
            items: paginatedResult.items.map(ProviderApplicationMapper.toResponse),
            pagination: paginatedResult.pagination,
        };
    }
}