import type { User } from "../../domain/entities/User.js";
import type { AuthUserDTO } from "../dto/auth/AuthUserDTO.js";


export class LoginMapper {

  static toAuthResponse(user: User): AuthUserDTO {

    return {

      id: user.id as string,

      fullName: user.fullName,

      email: user.email,

      roles: user.roles,
      
      isVerified: user.isVerified,

      ...(user.providerProfile && {
        providerProfile: {
          ...user.providerProfile,
          // Never expose sensitive verification documents (ID proof, NGO registration) in auth responses
          documents: {
            ...(user.providerProfile.documents?.profileImage && {
              profileImage: user.providerProfile.documents.profileImage,
            }),
            ...(user.providerProfile.documents?.logo && {
              logo: user.providerProfile.documents.logo,
            }),
          },
        },
      }),
    };
  }
}

export { LoginMapper as UserMapper };