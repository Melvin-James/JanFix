import type { ClientSession } from "mongoose";
import type { Donation } from "../entities/Donation.ts";
import type { DonationStatus } from "../enums/DonationStatus.ts";

export interface PaginatedDonations {
  donations: Donation[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface IDonationRepository {
  create(donation: Partial<Donation>, session?: ClientSession): Promise<Donation>;
  findById(id: string): Promise<Donation | null>;
  findByPaymentIntentId(paymentIntentId: string): Promise<Donation | null>;
  updateStatus(
    id: string,
    status: DonationStatus,
    extra?: {
      paidAt?: Date;
      failureReason?: string;
      stripePaymentIntentId?: string;
    },
    session?: ClientSession
  ): Promise<Donation | null>;
  markSucceededIfNotSucceeded(
    id: string,
    paymentIntentId: string,
    paidAt: Date,
    session?: ClientSession
  ): Promise<Donation | null>;
  updateStatusIfNotSucceeded(
    id: string,
    paymentIntentId: string,
    status: DonationStatus,
    extra?: {
      failureReason?: string;
    },
    session?: ClientSession
  ): Promise<Donation | null>;
  updatePaymentIntentId(
    id: string,
    expectedCurrentPaymentIntentId: string | null,
    newPaymentIntentId: string,
    session?: ClientSession
  ): Promise<Donation | null>;
  findSuccessfulByIssueId(
    issueId: string,
    page: number,
    pageSize: number
  ): Promise<PaginatedDonations>;
  findSuccessfulDonorsSummary(
    issueId: string
  ): Promise<{ totalAmountPaise: number; donorCount: number }>;
}
