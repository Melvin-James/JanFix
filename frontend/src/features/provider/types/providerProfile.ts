export interface ProviderProfile {

  id: string;

  providerType: string;

  onboardingStatus: string;

  verificationStatus: string;

  providerName?: string;

  responsiblePersonName?: string;

  address?: string;

  phone?: string;

  governmentId?: string;

  categoriesWillingToWork?: string[];

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