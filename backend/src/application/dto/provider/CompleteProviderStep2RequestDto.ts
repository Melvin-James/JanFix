import type { UploadedFile } from "../../../domain/entities/UploadedFile.js";

export interface CompleteProviderStep2RequestDto {

  userId: string;

  providerName: string;

  responsiblePersonName : string;

  address: string;

  phone: string;

  identityProof: UploadedFile;

  categoriesWillingToWork: string[];

  websiteLinks?: string[];

  profileImage?: UploadedFile;

  previousCommunityPhotos?: UploadedFile[];

  volunteerGroupProfile?: {

    memberCount: number;

    logo?: UploadedFile;
  };

  organizationProfile?: {

    memberCount: number;

    ngoRegistrationDocument?: UploadedFile;

    logo?: UploadedFile;
  };
}