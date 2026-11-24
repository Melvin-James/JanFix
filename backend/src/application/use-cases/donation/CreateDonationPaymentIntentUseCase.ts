import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.ts";
import ApiError from "../../../shared/utils/apiError.ts";
import type { IIssueRepository } from "../../../domain/interface/IIssueRepository.ts";
import type { IUserRepository } from "../../../domain/interface/IUserRepository.ts";
import type { IDonationRepository } from "../../../domain/interface/IDonationRepository.ts";
import type { StripeService } from "../../../infrastructure/services/StripeService.ts";
import { IssueStatus } from "../../../domain/enums/IssueStatus.ts";
import { IssueVisibility } from "../../../domain/enums/IssueVisibility.ts";
import { ProposalFundingType } from "../../../domain/enums/ProposalFundingType.ts";
import { DonationStatus } from "../../../domain/enums/DonationStatus.ts";
import { PaymentProvider } from "../../../domain/enums/PaymentProvider.ts";
import type {
  CreateDonationIntentInput,
  CreateDonationIntentResult,
} from "../../dto/donation/CreateDonationIntentDTO.ts";

export class CreateDonationPaymentIntentUseCase {
  constructor(
    private _issueRepository: IIssueRepository,
    private _userRepository: IUserRepository,
    private _donationRepository: IDonationRepository,
    private _stripeService: StripeService
  ) {}

  async execute(
    userId: string,
    input: CreateDonationIntentInput
  ): Promise<CreateDonationIntentResult> {
    const { issueId, amountPaise, isAnonymous = false, message } = input;

    if (!amountPaise || amountPaise < 100) {
      throw new ApiError(
        HttpStatusCode.BAD_REQUEST,
        "Minimum donation amount is ₹1.00 (100 paise)."
      );
    }

    const issue = await this._issueRepository.findById(issueId);
    if (!issue || !issue.id) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "Issue not found.");
    }

    if (issue.visibility !== IssueVisibility.PUBLIC) {
      throw new ApiError(
        HttpStatusCode.BAD_REQUEST,
        "Only public community issues are eligible for donations."
      );
    }

    if (issue.status !== IssueStatus.FUNDRAISING) {
      throw new ApiError(
        HttpStatusCode.BAD_REQUEST,
        `Issue is currently in ${issue.status} status and is not accepting donations.`
      );
    }

    if (
      !issue.fundingSnapshot ||
      issue.fundingSnapshot.fundingType !== ProposalFundingType.COMMUNITY_FUNDING
    ) {
      throw new ApiError(
        HttpStatusCode.BAD_REQUEST,
        "This project is not configured for community fundraising."
      );
    }

    const amountRaised = issue.fundingSnapshot.amountRaisedPaise || 0;
    const targetAmount = issue.fundingSnapshot.fundingTargetPaise || 0;

    if (targetAmount > 0 && amountRaised >= targetAmount) {
      throw new ApiError(
        HttpStatusCode.BAD_REQUEST,
        "The funding target for this issue has already been achieved."
      );
    }

    const user = await this._userRepository.findById(userId);
    if (!user || !user.id) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "User profile not found.");
    }

    const authoritativeDonorName = user.fullName?.trim() || "Community Contributor";
    const donorEmail = user.email;

    // Create a pending donation in the database first
    const pendingDonation = await this._donationRepository.create({
      issueId: issue.id,
      userId: user.id,
      donorName: authoritativeDonorName,
      donorEmail,
      amountPaise,
      currency: "inr",
      status: DonationStatus.PENDING,
      paymentProvider: PaymentProvider.STRIPE,
      isAnonymous,
      message: message?.trim() ?? undefined,
    });

    // Create Stripe PaymentIntent with metadata linking to donation & issue
    const idempotencyKey = `don_${pendingDonation.id}_${Date.now()}`;

    const paymentIntent = await this._stripeService.createPaymentIntent({
      amountPaise,
      currency: "inr",
      metadata: {
        donationId: pendingDonation.id,
        issueId: issue.id,
        userId: user.id,
        isAnonymous: String(isAnonymous),
      },
      idempotencyKey,
    });

    if (!paymentIntent.client_secret) {
      throw new ApiError(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        "Failed to initialize Stripe payment session."
      );
    }

    // Update donation with Stripe references
    await this._donationRepository.updateStatus(
      pendingDonation.id,
      DonationStatus.PENDING,
      {
        stripePaymentIntentId: paymentIntent.id,
      }
    );

    return {
      donationId: pendingDonation.id,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amountPaise,
      currency: "inr",
    };
  }
}
