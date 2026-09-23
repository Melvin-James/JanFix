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

      authProvider: document.authProvider,

      accountStatus: document.accountStatus,

      googleId: document.googleId,

      ...(document.providerProfile && {
        providerProfile:
        {
          identity: {
            providerType: document.providerProfile.identity?.providerType,
            providerName: document.providerProfile.identity?.providerName,
            responsiblePersonName:
              document.providerProfile.identity?.responsiblePersonName,
            address: document.providerProfile.identity?.address,
            phone: document.providerProfile.identity?.phone,
          },

          documents: {
            identityProof:
              document.providerProfile.documents?.identityProof
                ? {
                  key: document.providerProfile.documents.identityProof.key,
                  url: document.providerProfile.documents.identityProof.url,
                  originalName:
                    document.providerProfile.documents.identityProof.originalName,
                  mimeType: document.providerProfile.documents.identityProof.mimeType,
                  size: document.providerProfile.documents.identityProof.size,
                }
                : undefined,

            profileImage:
              document.providerProfile.documents?.profileImage
                ? {
                  key: document.providerProfile.documents.profileImage.key,
                  url: document.providerProfile.documents.profileImage.url,
                  originalName:
                    document.providerProfile.documents.profileImage.originalName,
                  mimeType: document.providerProfile.documents.profileImage.mimeType,
                  size: document.providerProfile.documents.profileImage.size,
                }
                : undefined,

            previousCommunityPhotos:
              document.providerProfile.documents?.previousCommunityPhotos?.map(
                (file: any) => ({
                  key: file.key,
                  url: file.url,
                  originalName: file.originalName,
                  mimeType: file.mimeType,
                  size: file.size,
                })
              ),

            ngoRegistrationDocument:
              document.providerProfile.documents?.ngoRegistrationDocument
                ? {
                  key: document.providerProfile.documents.ngoRegistrationDocument.key,
                  url: document.providerProfile.documents.ngoRegistrationDocument.url,
                  originalName: document.providerProfile.documents.ngoRegistrationDocument.originalName,
                  mimeType: document.providerProfile.documents.ngoRegistrationDocument.mimeType,
                  size: document.providerProfile.documents.ngoRegistrationDocument.size,
                }
                : undefined,

            logo:
              document.providerProfile.documents?.logo
                ? {
                  key: document.providerProfile.documents.logo.key,
                  url: document.providerProfile.documents.logo.url,
                  originalName:
                    document.providerProfile.documents.logo.originalName,
                  mimeType: document.providerProfile.documents.logo.mimeType,
                  size: document.providerProfile.documents.logo.size,
                }
                : undefined,
          },

          workPreferences: {
            categoriesWillingToWork:
              document.providerProfile.workPreferences?.categoriesWillingToWork,

            websiteLinks: document.providerProfile.workPreferences?.websiteLinks,
          },

          ...(document.providerProfile.volunteerGroupProfile && {
            volunteerGroupProfile: {
              memberCount: document.providerProfile.volunteerGroupProfile.memberCount
            },
          }),

          ...(document.providerProfile.organizationProfile && {
            organizationProfile: {
              memberCount: document.providerProfile.organizationProfile.memberCount,
            },
          }),

          status: {
            applicationStatus: document.providerProfile.status.applicationStatus,
            providerStatus: document.providerProfile.status.providerStatus,
            submittedAt: document.providerProfile.status.submittedAt,
            reviewedAt: document.providerProfile.status.reviewedAt,
            rejectionReason: document.providerProfile.status.rejectionReason,
          },
        },
      })
    }
  }
}