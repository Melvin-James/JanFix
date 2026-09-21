import type { ProviderType } from "../../../domain/enums/ProviderType.js";

import type { ApplicationStatus } from "../../../domain/enums/ApplicationStatus.js";

import type { UploadedFile } from "../../../domain/entities/UploadedFile.js";

export interface ProviderApplicationDetailsResponseDTO {

    id: string;
    fullName: string;
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
        submittedAt: Date;
        reviewedAt?: Date;
        rejectionReason?: string;
    };

}