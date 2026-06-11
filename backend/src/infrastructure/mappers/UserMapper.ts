import type { User }
from "../../domain/entities/User.js";

export class UserMapper {

  static toEntity(
    document: any
  ): User {

    return {

      id:
        document._id.toString(),

      name:
        document.name,

      email:
        document.email,

      password:
        document.password,

      role:
        document.role,

      isVerified:
        document.isVerified,
    };
  }
}