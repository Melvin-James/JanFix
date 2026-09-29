import type { IUserRepository, ServiceProviderFilters } from "../../../domain/interface/IUserRepository.js";

import type { ServiceProviderResponseDTO } from "../../dto/admin/ServiceProviderResponseDTO.js";

import { ServiceProviderMapper } from "../../mappers/ServiceProviderMapper.js";

import type { IGetServiceProvidersUseCase } from "../usecase interfaces/IGetServiceProvidersUseCase.js";
import type { PaginatedResult } from "../../../shared/types/Pagination.js";

export class GetServiceProvidersUseCase implements IGetServiceProvidersUseCase{
    constructor(
        private readonly userRepository : IUserRepository
    ) {}

    async execute(
        page = 1,
        pageSize = 10,
        filters?: ServiceProviderFilters
    ): Promise<PaginatedResult<ServiceProviderResponseDTO>> {
        const paginatedResult = await this.userRepository.findPaginatedServiceProviders(
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