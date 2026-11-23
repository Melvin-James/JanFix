import type { DonationStatus } from "../enums/DonationStatus.js";
import type { PaymentProvider } from "../enums/PaymentProvider.js";

export interface Donation {
  id: string;
  issueId: string;
  userId: string;
  donorName: string;
  donorEmail?: string | undefined;
  amountPaise: number;
  currency: string;
  status: DonationStatus;
  paymentProvider: PaymentProvider;
  stripePaymentIntentId?: string | undefined;
  isAnonymous: boolean;
  message?: string | undefined;
  failureReason?: string | undefined;
  paidAt?: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
}
