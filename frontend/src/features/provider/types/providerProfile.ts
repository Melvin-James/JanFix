import type { ProviderType } from "./providerTypes";

import type { UploadedFile } from "./uploadedFile";

export interface ProviderProfile {

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

    submittedAt: string;

    reviewedAt?: string;

    rejectionReason?: string | null;

  };

  
}