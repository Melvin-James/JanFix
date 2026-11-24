export interface CreateDonationIntentRequest {
  issueId: string;
  amountPaise: number;
  isAnonymous?: boolean;
  message?: string;
}

export interface CreateDonationIntentResponse {
  donationId: string;
  paymentIntentId: string;
  clientSecret: string;
  amountPaise: number;
  currency: string;
}

export interface RetryDonationResponse {
  status: "READY_FOR_PAYMENT" | "PROCESSING" | "ALREADY_SUCCEEDED" | "NOT_RETRYABLE";
  donationId: string;
  paymentIntentId?: string;
  clientSecret?: string;
  amountPaise: number;
  currency: string;
  message?: string;
}

export interface PublicDonor {
  id: string;
  donorName: string;
  amountPaise: number;
  createdAt: string;
  isAnonymous: boolean;
  message?: string;
}

export interface IssueDonationsResponse {
  donations: PublicDonor[];
  totalDonors: number;
  totalAmountRaisedPaise: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DonationStatusResponse {
  id: string;
  issueId: string;
  status:
    | "PENDING"
    | "PROCESSING"
    | "SUCCEEDED"
    | "FAILED"
    | "CANCELED"
    | "REFUNDED"
    | "PARTIALLY_REFUNDED";
  amountPaise: number;
  currency: string;
  paidAt?: string;
  failureReason?: string;
  createdAt: string;
}
