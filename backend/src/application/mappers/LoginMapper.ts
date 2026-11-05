import type { User } from "../../domain/entities/User.js";
import type { AuthUserDTO } from "../dto/auth/AuthUserDTO.js";
import { ApplicationStatus } from "../../domain/enums/ApplicationStatus.js";
import { ProviderStatus } from "../../domain/enums/ProviderStatus.js";
import type { ApplicationMode } from "../../shared/types/AccessTokenPayload.js";

export class LoginMapper {

  static toAuthResponse(user: User, activeMode: ApplicationMode = "USER"): AuthUserDTO {
    const isApproved = user.providerProfile?.status?.applicationStatus === ApplicationStatus.APPROVED;
    const hasPayoutDetails = Boolean(
      user.providerProfile?.payoutDetails?.accountHolderName &&
      user.providerProfile?.payoutDetails?.upiId
    );
    const isActivated = isApproved && user.providerProfile?.status?.providerStatus === ProviderStatus.ACTIVE && hasPayoutDetails;

    let providerProfilePayload = undefined;
    if (user.providerProfile) {
      const { payoutDetails: _omitted, ...safeProfile } = user.providerProfile;
      providerProfilePayload = {
        ...safeProfile,
        // Never expose sensitive verification documents (ID proof, NGO registration) in auth responses
        documents: {
          ...(user.providerProfile.documents?.profileImage && {
            profileImage: user.providerProfile.documents.profileImage,
          }),
          ...(user.providerProfile.documents?.logo && {
            logo: user.providerProfile.documents.logo,
          }),
        },
      };
    }

    return {

      id: user.id as string,

      fullName: user.fullName,

      email: user.email,

      roles: user.roles,
      
      isVerified: user.isVerified,

      accountStatus: user.accountStatus,

      activeMode,

      providerAccess: {
        isApproved,
        isActivated,
        hasPayoutDetails,
      },

      ...(providerProfilePayload && {
        providerProfile: providerProfilePayload,
      }),
    };
  }
}

export { LoginMapper as UserMapper };
