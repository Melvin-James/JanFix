import type { ProviderType } from "../enums/ProviderType.js";
import type { OnboardingStatus } from "../enums/OnboardingStatus.js";
import type { VerificationStatus } from "../enums/VerificationStatus.js";

import type { UploadedFile } from "./UploadedFile.js";

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

    onboardingStatus: OnboardingStatus;

    verificationStatus: VerificationStatus;
}

export interface ProviderProfile {

    identity: ProviderIdentity;

    documents: ProviderDocuments;

    workPreferences: ProviderWorkPreferences;

    volunteerGroupProfile?: VolunteerGroupProfile;

    organizationProfile?: OrganizationProfile;

    status: ProviderStatus;
}