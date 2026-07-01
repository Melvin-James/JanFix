import type { User } from "../../domain/entities/User.js";

export class UserMapper {

  static toEntity(document: any): User {

    return {

      id: document._id.toString(),

      fullName: document.fullName,

      email: document.email,

      password: document.password,

      roles: document.roles,

      isVerified: document.isVerified,

      ...(document.providerProfile && {
        providerProfile:
        {
          identity: document.providerProfile.identity,

          documents: document.providerProfile.documents,

          workPreferences: document.providerProfile.workPreferences,

          volunteerGroupProfile:
            document.providerProfile.volunteerGroupProfile,

          organizationProfile:
            document.providerProfile.organizationProfile,

          status:
            document.providerProfile.status,
        }
      })
    }
  }
}