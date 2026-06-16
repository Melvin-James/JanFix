export interface CompleteProviderStep2RequestDto {

  userId: string;

  providerName: string;

  responsiblePersonName : string;

  address: string;

  phone: string;

  governmentId: string;

  categoriesWillingToWork: string[];

  websiteLinks?: string[];

  profileImage?: string;

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