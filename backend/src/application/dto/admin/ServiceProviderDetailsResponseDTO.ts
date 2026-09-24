import type { ProviderType } from "../../../domain/enums/ProviderType.js";
import type { ProviderStatus } from "../../../domain/enums/ProviderStatus.js";
import type { ApplicationStatus } from "../../../domain/enums/ApplicationStatus.js";
import type { UploadedFile } from "../../../domain/entities/UploadedFile.js";

export interface ServiceProviderDetailsResponseDTO {
    id: string;
    email: string;

    identity: {
        providerType?: ProviderType;
        providerName?: string;
        responsiblePersonName?: string;
        address?: string;
        phone?: string;
    };

    documents: {
        identityProof?: UploadedFile;
        profileImage?: UploadedFile;
        previousCommunityPhotos?: UploadedFile[];
        ngoRegistrationDocument?: UploadedFile;
        logo?: UploadedFile;
    };

    workPreferences: {
        categoriesWillingToWork?: string[];
        websiteLinks?: string[];
    };

    volunteerGroupProfile?: {
        memberCount: number;
    };

    organizationProfile?: {
        memberCount: number;
    };

    status: {
        applicationStatus: ApplicationStatus;
        providerStatus?: ProviderStatus | undefined;
        submittedAt: Date;
        reviewedAt?: Date;
        rejectionReason?: string;
    };
}