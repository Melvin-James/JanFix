import type { IDonationRepository } from "../../../domain/interface/IDonationRepository.js";
import type {
  IssueDonationsResponseDTO,
  PublicDonorDTO,
} from "../../dto/donation/DonationResponseDTO.js";

export class GetIssueDonationsUseCase {
  constructor(private donationRepository: IDonationRepository) {}

  async execute(
    issueId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<IssueDonationsResponseDTO> {
    const [paginated, summary] = await Promise.all([
      this.donationRepository.findSuccessfulByIssueId(issueId, page, pageSize),
      this.donationRepository.findSuccessfulDonorsSummary(issueId),
    ]);

    const sanitizedDonations: PublicDonorDTO[] = paginated.donations.map((d) => ({
      id: d.id,
      donorName: d.isAnonymous ? "Anonymous" : d.donorName,
      amountPaise: d.amountPaise,
      createdAt: d.createdAt,
      isAnonymous: d.isAnonymous,
      message: d.message ?? undefined,
    }));

    return {
      donations: sanitizedDonations,
      totalDonors: summary.donorCount,
      totalAmountRaisedPaise: summary.totalAmountPaise,
      page: paginated.page,
      pageSize: paginated.pageSize,
      totalPages: paginated.totalPages,
    };
  }
}
