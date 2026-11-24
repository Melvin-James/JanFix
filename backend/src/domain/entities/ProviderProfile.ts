import type { ProviderType } from "../enums/ProviderType.ts";

import type { ApplicationStatus } from "../enums/ApplicationStatus.ts";

import type { UploadedFile } from "./UploadedFile.ts";

import type { ProviderStatus as ProviderOperationalStatus } from "../enums/ProviderStatus.ts";

export interface ProviderIdentity {

    providerType?: ProviderType;

    providerName?: string;

    responsiblePersonName?: string;

    address?: string;

    phone?: string;
}

export interface ProviderDocuments {

    identityProof?: UploadedFile;

    profileImage?: UploadedFile;

    previousCommunityPhotos?: UploadedFile[];

    ngoRegistrationDocument?: UploadedFile;

    logo?: UploadedFile;
}

export interface ProviderWorkPreferences {

    categoriesWillingToWork?: string[];

    websiteLinks?: string[];
}

export interface VolunteerGroupProfile {

    memberCount: number;
}

export interface OrganizationProfile {

    memberCount: number;
}

export interface ProviderStatus {

    applicationStatus: ApplicationStatus;

    providerStatus?: ProviderOperationalStatus | undefined;

    submittedAt: Date;

    reviewedAt?: Date;

    rejectionReason?: string;
}

export interface ProviderPayoutDetails {

    accountHolderName: string;

    upiId: string;

    bankAccountNumber?: string;

    ifscCode?: string;

    submittedAt: Date;
}

export interface ProviderProfile {

    identity: ProviderIdentity;

    documents: ProviderDocuments;

    workPreferences: ProviderWorkPreferences;

    volunteerGroupProfile?: VolunteerGroupProfile;

    organizationProfile?: OrganizationProfile;

    status: ProviderStatus;

    payoutDetails?: ProviderPayoutDetails | undefined;
}
