import type { ProviderType } from "./providerTypes";

import type { UploadedFile } from "./uploadedFile";

export interface ProviderPayoutDetails {
  accountHolderName: string;
  upiId: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  submittedAt?: string;
}

export interface ProviderProfile {

  onboardingStatus?: string;

  identity: {

    providerType: ProviderType;

    providerName: string;

    responsiblePersonName: string;

    address: string;

    phone: string;

  };

  documents: {

    identityProof: UploadedFile;

    profileImage?: UploadedFile;

    previousCommunityPhotos?: UploadedFile[];

    ngoRegistrationDocument?: UploadedFile;

    logo?: UploadedFile;

  };

  workPreferences: {

    categoriesWillingToWork: string[];

    websiteLinks?: string[];

  }

  volunteerGroupProfile?:{

    memberCount: number;

  }

  organizationProfile?: {

    memberCount: number;

  }

  status: {

    applicationStatus: string;

    providerStatus?: string;

    submittedAt: string;

    reviewedAt?: string;

    rejectionReason?: string | null;

  };

  payoutDetails?: ProviderPayoutDetails;
}
