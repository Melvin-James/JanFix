import type { UserManagementResponseDTO } from "../../dto/admin/UserManagementResponseDTO.js";
import type { PaginatedResult } from "../../../shared/types/Pagination.js";
import type { UserManagementFilters } from "../../../domain/interface/IUserRepository.js";

export interface IGetUsersForManagementUseCase {

    execute(
        page?: number,
        pageSize?: number,
        filters?: UserManagementFilters
    ): Promise<PaginatedResult<UserManagementResponseDTO>>;
    
}