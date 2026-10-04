import type { User } from "../../domain/entities/User.js";

import type { RegisterResponseDTO } from "../dto/auth/RegisterResponseDTO.js";

export class RegisterUserMapper {
    static toResponse(user: User): RegisterResponseDTO {

        return {

            id: user.id as string,

            fullName: user.fullName,

            email: user.email,

            roles: user.roles,

            isVerified: user.isVerified,
        }
    }
}