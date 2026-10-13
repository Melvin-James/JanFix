import { ProviderType } from "../../provider/types/providerTypes";

import type { UploadedFile } from "../../provider/types/uploadedFile";

export type ApplicatonStatus = 
    | "UNDER_REVIEW"
    | "APPROVED"
    | "REJECTED";

export interface ProviderApplication {
    id: string;
    fullName: string;
    email: string;
    providerType?: ProviderType;
    providerName?: string;
    applicationStatus: ApplicatonStatus;
    submittedAt: string;
}



export interface ProviderApplicationsDetails {
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
    }

    workPreferences: {
        categoriesWillingToWork?: string[];
        websiteLinks?: string[];
    }

    volunteerGroupProfile?: {
        memberCount: number;
    }

    organizationProfile?: {
        memberCount: number;
    };

    status: {
        applicationStatus: ApplicatonStatus;
        submittedAt: string;
        reviewedAt?: string;
        rejectionReason?: string;
    };
}