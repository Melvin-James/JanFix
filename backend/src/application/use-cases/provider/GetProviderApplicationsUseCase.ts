import type { IUserRepository, ProviderApplicationFilters } from "../../../domain/interface/IUserRepository.ts";

import type { IGetProviderApplicationsUseCase } from "../usecase interfaces/admin/IGetProviderApplicationsUseCase.ts";

import type { ProviderApplicationResponseDTO } from "../../dto/admin/ProviderApplicationResponseDTO.ts";

import { ProviderApplicationMapper } from "../../mappers/ProviderApplicationMapper.ts";

import type { PaginatedResult } from "../../../shared/types/Pagination.ts";

export class GetProviderApplicationsUseCase implements IGetProviderApplicationsUseCase {
    constructor(
        private _userRepository: IUserRepository
    ) {}

    async execute(
        page = 1,
        pageSize = 10,
        filters?: ProviderApplicationFilters
    ): Promise<PaginatedResult<ProviderApplicationResponseDTO>> {
        
        const paginatedResult = await this._userRepository.findPaginatedProviderApplications(
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
