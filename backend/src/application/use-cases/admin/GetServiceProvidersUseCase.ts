import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";

import type { ServiceProviderResponseDTO } from "../../dto/admin/ServiceProviderResponseDTO.js";

import { ServiceProviderMapper } from "../../mappers/ServiceProviderMapper.js";

import type { IGetServiceProvidersUseCase } from "../usecase interfaces/IGetServiceProvidersUseCase.js";

export class GetServiceProvidersUseCase implements IGetServiceProvidersUseCase{
    constructor(
        private readonly userRepository : IUserRepository
    ) {}

    async execute(): Promise<ServiceProviderResponseDTO[]> {
        const providers = await this.userRepository.findApprovedServiceProviders();

        return providers.map(ServiceProviderMapper.toResponse);
    }
}