import type { User } from "../../domain/entities/User.js";


export class UserMapper {

  static toAuthResponse(user: User) {

    return {

      id: user.id as string,

      fullName: user.fullName,

      email: user.email,

      roles: user.roles,
      
      isVerified: user.isVerified,
    };
  }
}