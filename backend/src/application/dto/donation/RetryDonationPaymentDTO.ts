export interface RetryDonationPaymentResult {
  status: "READY_FOR_PAYMENT" | "PROCESSING" | "ALREADY_SUCCEEDED" | "NOT_RETRYABLE";
  donationId: string;
  paymentIntentId?: string | undefined;
  clientSecret?: string | undefined;
  amountPaise: number;
  currency: string;
  message?: string | undefined;
}
