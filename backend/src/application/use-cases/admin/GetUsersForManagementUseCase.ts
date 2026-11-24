import type { IUserRepository, UserManagementFilters } from "../../../domain/interface/IUserRepository.ts";

import type { IGetUsersForManagementUseCase } from "../usecase interfaces/admin/IGetUsersForManagementUseCase.ts";

import type { UserManagementResponseDTO } from "../../dto/admin/UserManagementResponseDTO.ts";

import { UserManagementMapper } from "../../mappers/UserManagementMapper.ts";

import type { PaginatedResult } from "../../../shared/types/Pagination.ts";

export class GetUsersForManagementUseCase implements IGetUsersForManagementUseCase {

    constructor(
        
        private readonly _userRepository: IUserRepository
    
    ) {}

    async execute(
        
        page = 1,
        
        pageSize = 10,
        
        filters?: UserManagementFilters
    
    ): Promise<PaginatedResult<UserManagementResponseDTO>> {
        
        const paginatedResult = await this._userRepository.findPaginatedUsersForManagement(
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
