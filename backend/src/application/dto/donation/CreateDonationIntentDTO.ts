import { z } from "zod";

export const createDonationIntentSchema = z.object({
  issueId: z.string().min(1, "Issue ID is required"),
  amountPaise: z
    .number()
    .int("Amount must be an integer in paise")
    .min(100, "Minimum donation amount is ₹1.00 (100 paise)"),
  isAnonymous: z.boolean().optional().default(false),
  message: z.string().max(500, "Message cannot exceed 500 characters").optional(),
});

export interface CreateDonationIntentInput {
  issueId: string;
  amountPaise: number;
  isAnonymous?: boolean | undefined;
  message?: string | undefined;
}

export interface CreateDonationIntentResult {
  donationId: string;
  paymentIntentId: string;
  clientSecret: string;
  amountPaise: number;
  currency: string;
}
