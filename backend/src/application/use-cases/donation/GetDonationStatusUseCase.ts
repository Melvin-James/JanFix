import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";
import ApiError from "../../../shared/utils/apiError.js";
import type { IDonationRepository } from "../../../domain/interface/IDonationRepository.js";
import type { DonationStatusResponseDTO } from "../../dto/donation/DonationResponseDTO.js";

export class GetDonationStatusUseCase {
  constructor(private donationRepository: IDonationRepository) {}

  async execute(
    donationId: string,
    userId: string
  ): Promise<DonationStatusResponseDTO> {
    const donation = await this.donationRepository.findById(donationId);
    if (!donation) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "Donation not found.");
    }

    // Only the donor who initiated the donation or an admin should view status
    if (donation.userId !== userId) {
      throw new ApiError(
        HttpStatusCode.FORBIDDEN,
        "You are not authorized to view this donation status."
      );
    }

    return {
      id: donation.id,
      issueId: donation.issueId,
      status: donation.status,
      amountPaise: donation.amountPaise,
      currency: donation.currency,
      paidAt: donation.paidAt ?? undefined,
      failureReason: donation.failureReason ?? undefined,
    };
  }
}
