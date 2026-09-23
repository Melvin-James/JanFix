import type { UserManagementResponseDTO } from "../../dto/admin/UserManagementResponseDTO.js";

export interface IGetUsersForManagementUseCase {

    execute(): Promise<UserManagementResponseDTO[]>;
    
}