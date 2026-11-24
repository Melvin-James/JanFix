import type { DonationStatus } from "../../../domain/enums/DonationStatus.ts";

export interface PublicDonorDTO {
  id: string;
  donorName: string;
  amountPaise: number;
  createdAt: Date;
  isAnonymous: boolean;
  message?: string | undefined;
}

export interface IssueDonationsResponseDTO {
  donations: PublicDonorDTO[];
  totalDonors: number;
  totalAmountRaisedPaise: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DonationStatusResponseDTO {
  id: string;
  issueId: string;
  status: DonationStatus;
  amountPaise: number;
  currency: string;
  paidAt?: Date | undefined;
  failureReason?: string | undefined;
  createdAt: Date;
}
