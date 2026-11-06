import type { User } from "../../domain/entities/User.js";
import type { AuthUserDTO } from "../dto/auth/AuthUserDTO.js";

export class RegisterUserMapper {
    static toResponse(user: User): AuthUserDTO {
        return {
            id: user.id as string,
            fullName: user.fullName,
            email: user.email,
            roles: user.roles,
            activeMode: user.activeMode ?? "USER",
            isVerified: user.isVerified,
            accountStatus: user.accountStatus,
            ...(user.providerProfile && { providerProfile: user.providerProfile }),
        };
    }
}