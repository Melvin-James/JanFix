import type { ProviderType } from "../enums/ProviderType.js";

import type { OnboardingStatus } from "../enums/OnboardingStatus.js";

import type { VerificationStatus } from "../enums/VerificationStatus.js";

export interface ServiceProvider {

  id?: string;

  userId: string;

  providerType?: ProviderType;

  onboardingStatus: OnboardingStatus;

  verificationStatus: VerificationStatus;

  providerName?: string;

  responsiblePersonName?: string;

  address?: string;

  phone?: string;

  governmentId?: string;

  profileImage?: string;

  categoriesWillingToWork?: string[];

  websiteLinks?: string[];

  previousCommunityPhotos?: string[];

  volunteerGroupProfile?: {

    memberCount: number;

    logo?: string;
  };

  organizationProfile?: {

    memberCount: number;

    ngoRegistrationDocument?: string;

    logo?: string;
  };
}