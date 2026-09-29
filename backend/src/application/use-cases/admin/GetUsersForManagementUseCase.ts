import type { IUserRepository, UserManagementFilters } from "../../../domain/interface/IUserRepository.js";

import type { IGetUsersForManagementUseCase } from "../usecase interfaces/IGetUsersForManagementUseCase.js";

import type { UserManagementResponseDTO } from "../../dto/admin/UserManagementResponseDTO.js";

import { UserManagementMapper } from "../../mappers/UserManagementMapper.js";
import type { PaginatedResult } from "../../../shared/types/Pagination.js";

export class GetUsersForManagementUseCase implements IGetUsersForManagementUseCase {
    constructor(
        private readonly userRepository: IUserRepository
    ) {}

    async execute(
        page = 1,
        pageSize = 10,
        filters?: UserManagementFilters
    ): Promise<PaginatedResult<UserManagementResponseDTO>> {
        
        const paginatedResult = await this.userRepository.findPaginatedUsersForManagement(
            page,
            pageSize,
            filters
        );

        return {
            items: paginatedResult.items.map((user) => UserManagementMapper.toResponse(user)),
            pagination: paginatedResult.pagination,
        };
    }
}