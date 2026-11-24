import type { IUserRepository, ServiceProviderFilters } from "../../../domain/interface/IUserRepository.ts";

import type { ServiceProviderResponseDTO } from "../../dto/admin/ServiceProviderResponseDTO.ts";

import { ServiceProviderMapper } from "../../mappers/ServiceProviderMapper.ts";

import type { IGetServiceProvidersUseCase } from "../usecase interfaces/admin/IGetServiceProvidersUseCase.ts";

import type { PaginatedResult } from "../../../shared/types/Pagination.ts";

export class GetServiceProvidersUseCase implements IGetServiceProvidersUseCase{
    constructor(
        private readonly _userRepository : IUserRepository
    ) {}

    async execute(
        page = 1,
        pageSize = 10,
        filters?: ServiceProviderFilters
    ): Promise<PaginatedResult<ServiceProviderResponseDTO>> {
        const paginatedResult = await this._userRepository.findPaginatedServiceProviders(
            page,
            pageSize,
            filters
        );

        return {
            items: paginatedResult.items.map(ServiceProviderMapper.toResponse),
            pagination: paginatedResult.pagination,
        };
    }
}
