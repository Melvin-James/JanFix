import type { ApplicatonStatus } from "./ProviderApplication";

import type { ProviderStatus } from "./ServiceProvider";

import { ProviderType } from "../../provider/types/providerTypes";

import type { UploadedFile } from "../../provider/types/uploadedFile";

export interface ServiceProviderDetails {
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
        applicationStatus: ApplicatonStatus;
        providerStatus: ProviderStatus;
        submittedAt: string;
        reviewedAt?: string;
        rejectionReason?: string;
    };
}