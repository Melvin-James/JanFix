import type { User } from "../../domain/entities/User.js";
import type { UserManagementResponseDTO } from "../dto/admin/UserManagementResponseDTO.js";

export class UserManagementMapper {
    static toResponse(user: User): UserManagementResponseDTO {
        return {
            id: user.id as string,
            fullName: user.fullName,
            email: user.email,
            roles: user.roles,
            isVerified: user.isVerified,
            authProvider: user.authProvider,
            accountStatus: user.accountStatus,
        };
    }
}