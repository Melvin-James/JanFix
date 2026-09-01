export interface CompleteProviderStep2Request {

  providerName: string;

  responsiblePersonName: string;

  address: string;

  phone: string;

  governmentId: string;

  categoriesWillingToWork: string[];

  volunteerGroupProfile?: {

    memberCount: number;

  };

  organizationProfile?: {

    memberCount: number;

  };
}