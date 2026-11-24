import type { UserManagementResponseDTO } from "../../../dto/admin/UserManagementResponseDTO.ts";
import type { PaginatedResult } from "../../../../shared/types/Pagination.ts";
import type { UserManagementFilters } from "../../../../domain/interface/IUserRepository.ts";

export interface IGetUsersForManagementUseCase {

    execute(
        page?: number,
        pageSize?: number,
        filters?: UserManagementFilters
    ): Promise<PaginatedResult<UserManagementResponseDTO>>;
    
}