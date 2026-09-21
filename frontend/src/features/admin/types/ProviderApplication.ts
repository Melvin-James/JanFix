export type ProviderType = 
    | "INDIVIDUAL"
    | "VOLUNTEER_GROUP"
    | "NGO";

export type ApplicatonStatus = 
    | "SUBMITTED"
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

export interface UploadedFile {
    url: string;
    publicId?: string;
    originalName?: string;
    mimeType?: string;
    size?: number;
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