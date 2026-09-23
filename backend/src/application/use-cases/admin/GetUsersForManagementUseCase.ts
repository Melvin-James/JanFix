import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";

import type { IGetUsersForManagementUseCase } from "../usecase interfaces/IGetUsersForManagementUseCase.js";

import type { UserManagementResponseDTO } from "../../dto/admin/UserManagementResponseDTO.js";

import { UserManagementMapper } from "../../mappers/UserManagementMapper.js";

export class GetUsersForManagementUseCase implements IGetUsersForManagementUseCase {
    constructor(
        private readonly userRepository: IUserRepository
    ) {}

    async execute(): Promise<UserManagementResponseDTO[]> {
        
        const users = await this.userRepository.findUsersForManagement();

        return users.map(
            (user) => UserManagementMapper.toResponse(user)
        );
    }
}