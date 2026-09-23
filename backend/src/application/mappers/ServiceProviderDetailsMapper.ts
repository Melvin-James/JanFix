import type { User } from "../../domain/entities/User.js";
import type { ServiceProviderDetailsResponseDTO } from "../dto/admin/ServiceProviderDetailsResponseDTO.js";

export class ServiceProviderDetailsMapper {
    static toResponse(
        user: User
    ): ServiceProviderDetailsResponseDTO {

        const providerProfile = user.providerProfile!;

        return {
            id: user.id as string,
            email: user.email,

            identity: {
                ...(providerProfile.identity.providerType && {
                    providerType: providerProfile.identity.providerType,
                }),

                ...(providerProfile.identity.providerName && {
                    providerName: providerProfile.identity.providerName,
                }),

                ...(providerProfile.identity.responsiblePersonName && {
                    responsiblePersonName:
                        providerProfile.identity.responsiblePersonName,
                }),

                ...(providerProfile.identity.address && {
                    address: providerProfile.identity.address,
                }),

                ...(providerProfile.identity.phone && {
                    phone: providerProfile.identity.phone,
                }),
            },

            documents: {
                ...(providerProfile.documents.identityProof && {
                    identityProof: providerProfile.documents.identityProof,
                }),

                ...(providerProfile.documents.profileImage && {
                    profileImage: providerProfile.documents.profileImage,
                }),

                ...(providerProfile.documents.previousCommunityPhotos && {
                    previousCommunityPhotos:
                        providerProfile.documents.previousCommunityPhotos,
                }),

                ...(providerProfile.documents.ngoRegistrationDocument && {
                    ngoRegistrationDocument:
                        providerProfile.documents.ngoRegistrationDocument,
                }),

                ...(providerProfile.documents.logo && {
                    logo: providerProfile.documents.logo,
                }),
            },

            workPreferences: {
                ...(providerProfile.workPreferences.categoriesWillingToWork && {
                    categoriesWillingToWork:
                        providerProfile.workPreferences.categoriesWillingToWork,
                }),

                ...(providerProfile.workPreferences.websiteLinks && {
                    websiteLinks:
                        providerProfile.workPreferences.websiteLinks,
                }),
            },

            ...(providerProfile.volunteerGroupProfile && {
                volunteerGroupProfile:
                    providerProfile.volunteerGroupProfile,
            }),

            ...(providerProfile.organizationProfile && {
                organizationProfile:
                    providerProfile.organizationProfile,
            }),

            status: {
                applicationStatus:
                    providerProfile.status.applicationStatus,

                providerStatus:
                    providerProfile.status.providerStatus,

                submittedAt:
                    providerProfile.status.submittedAt,

                ...(providerProfile.status.reviewedAt && {
                    reviewedAt:
                        providerProfile.status.reviewedAt,
                }),

                ...(providerProfile.status.rejectionReason && {
                    rejectionReason:
                        providerProfile.status.rejectionReason,
                }),
            },
        };
    }
}