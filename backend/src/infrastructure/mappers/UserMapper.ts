import type { Document } from "mongoose";
import type { User } from "../../domain/entities/User.js";
import type { UserDocument, UploadedFileDoc } from "../models/UserModel.js";

const mapFile = (file: UploadedFileDoc) => ({
  key: file.key,
  url: file.url,
  originalName: file.originalName,
  mimeType: file.mimeType,
  size: file.size,
});

export class UserMapper {

  static toEntity(doc: Document): User {
    const document = doc as UserDocument;

    return {

      id: document._id.toString(),

      fullName: document.fullName,

      email: document.email,

      ...(document.password !== undefined && { password: document.password }),

      roles: document.roles,

      isVerified: document.isVerified,

      authProvider: document.authProvider,

      accountStatus: document.accountStatus,

      ...(document.googleId !== undefined && { googleId: document.googleId }),

      ...(document.providerProfile && {
        providerProfile: {
          identity: {
            ...(document.providerProfile.identity?.providerType !== undefined && { providerType: document.providerProfile.identity.providerType }),
            ...(document.providerProfile.identity?.providerName !== undefined && { providerName: document.providerProfile.identity.providerName }),
            ...(document.providerProfile.identity?.responsiblePersonName !== undefined && { responsiblePersonName: document.providerProfile.identity.responsiblePersonName }),
            ...(document.providerProfile.identity?.address !== undefined && { address: document.providerProfile.identity.address }),
            ...(document.providerProfile.identity?.phone !== undefined && { phone: document.providerProfile.identity.phone }),
          },

          documents: {
            ...(document.providerProfile.documents?.identityProof && {
              identityProof: mapFile(document.providerProfile.documents.identityProof),
            }),

            ...(document.providerProfile.documents?.profileImage && {
              profileImage: mapFile(document.providerProfile.documents.profileImage),
            }),

            ...(document.providerProfile.documents?.ngoRegistrationDocument && {
              ngoRegistrationDocument: mapFile(document.providerProfile.documents.ngoRegistrationDocument),
            }),

            ...(document.providerProfile.documents?.logo && {
              logo: mapFile(document.providerProfile.documents.logo),
            }),

            ...(document.providerProfile.documents?.previousCommunityPhotos && {
              previousCommunityPhotos: document.providerProfile.documents.previousCommunityPhotos.map(mapFile),
            }),
          },

          workPreferences: {
            ...(document.providerProfile.workPreferences?.categoriesWillingToWork !== undefined && {
              categoriesWillingToWork: document.providerProfile.workPreferences.categoriesWillingToWork,
            }),
            ...(document.providerProfile.workPreferences?.websiteLinks !== undefined && {
              websiteLinks: document.providerProfile.workPreferences.websiteLinks,
            }),
          },

          ...(document.providerProfile.volunteerGroupProfile && {
            volunteerGroupProfile: {
              memberCount: document.providerProfile.volunteerGroupProfile.memberCount,
            },
          }),

          ...(document.providerProfile.organizationProfile && {
            organizationProfile: {
              memberCount: document.providerProfile.organizationProfile.memberCount,
            },
          }),

          status: {
            applicationStatus: document.providerProfile.status.applicationStatus,
            ...(document.providerProfile.status.providerStatus !== undefined && {
              providerStatus: document.providerProfile.status.providerStatus,
            }),
            submittedAt: document.providerProfile.status.submittedAt,
            ...(document.providerProfile.status.reviewedAt !== undefined && {
              reviewedAt: document.providerProfile.status.reviewedAt,
            }),
            ...(document.providerProfile.status.rejectionReason !== undefined && {
              rejectionReason: document.providerProfile.status.rejectionReason,
            }),
          },
        },
      }),
    }
  }
}