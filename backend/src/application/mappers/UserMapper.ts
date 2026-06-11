import type { User } from "../../domain/entities/User.js";

import type { RegisterResponseDTO } from "../dto/auth/RegisterResponseDTO.js";

export class UserMapper {

  static toAuthResponse(user: User) {
    return {
      id: user.id as string,
      name: user.name ?? "",
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    };
  }
}