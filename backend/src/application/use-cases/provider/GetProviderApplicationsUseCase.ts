import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";

import type { IGetProviderApplicationsUseCase } from "../usecase interfaces/IGetProviderApplicationsUseCase.js";

import type { ProviderApplicationResponseDTO } from "../../dto/admin/ProviderApplicationResponseDTO.js";

import { ProviderApplicationMapper } from "../../mappers/ProviderApplicationMapper.js";

export class GetProviderApplicationsUseCase implements IGetProviderApplicationsUseCase {
    constructor(
        private userRepository: IUserRepository
    ) {}

    async execute(): Promise<ProviderApplicationResponseDTO[]> {
        
        const users = await this.userRepository.findUsersWithProviderApplications();

        return users.map(ProviderApplicationMapper.toResponse);
    }
}