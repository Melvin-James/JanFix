import type { ServiceProvider } from "../../domain/entities/ServiceProvider.js";

export class ServiceProviderMapper {

  static toEntity(
    document: any
  ): ServiceProvider {

    return {

      id:
        document._id.toString(),

      userId:
        document.userId.toString(),

      providerType:
        document.providerType,

      onboardingStatus:
        document.onboardingStatus,

      verificationStatus:
        document.verificationStatus,

      providerName:
        document.providerName,

      responsiblePersonName:
        document.responsiblePersonName,

      address:
        document.address,

      phone:
        document.phone,

      governmentId:
        document.governmentId,

      profileImage:
        document.profileImage,

      categoriesWillingToWork:
        document.categoriesWillingToWork,

      websiteLinks:
        document.websiteLinks,

      previousCommunityPhotos:
        document.previousCommunityPhotos,

      ...(document.volunteerGroupProfile.memberCount ? {
        volunteerGroupProfile: {
          memberCount: document.volunteerGroupProfile.memberCount,
          logo: document.volunteerGroupProfile.logo,
        }
      } : {}),

      ...(document.organizationProfile.memberCount ? {
        organizationProfile: {
          memberCount: document.organizationProfile.memberCount,
          ngoRegistrationDocument: document.organizationProfile.ngoRegistrationDocument,
          logo: document.organizationProfile.logo,
        }
      } : {}),
    };
  }
}