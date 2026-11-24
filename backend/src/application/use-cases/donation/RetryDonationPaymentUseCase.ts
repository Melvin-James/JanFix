import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.ts";
import ApiError from "../../../shared/utils/apiError.ts";
import type { IDonationRepository } from "../../../domain/interface/IDonationRepository.ts";
import type { IIssueRepository } from "../../../domain/interface/IIssueRepository.ts";
import type { StripeService } from "../../../infrastructure/services/StripeService.ts";
import { DonationStatus } from "../../../domain/enums/DonationStatus.ts";
import { IssueStatus } from "../../../domain/enums/IssueStatus.ts";
import type { RetryDonationPaymentResult } from "../../dto/donation/RetryDonationPaymentDTO.ts";

export class RetryDonationPaymentUseCase {
  constructor(
    private _donationRepository: IDonationRepository,
    private _issueRepository: IIssueRepository,
    private _stripeService: StripeService
  ) {}

  async execute(
    donationId: string,
    userId: string
  ): Promise<RetryDonationPaymentResult> {
    const donation = await this._donationRepository.findById(donationId);
    if (!donation) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "Donation not found.");
    }

    // Authenticated user must own the donation
    if (donation.userId !== userId) {
      throw new ApiError(
        HttpStatusCode.FORBIDDEN,
        "You are not authorized to retry this donation."
      );
    }

    // Validate that the underlying issue is still accepting donations
    const issue = await this._issueRepository.findById(donation.issueId);
    if (!issue || issue.status !== IssueStatus.FUNDRAISING) {
      throw new ApiError(
        HttpStatusCode.BAD_REQUEST,
        "This project is no longer accepting donations."
      );
    }

    if (
      issue.fundingSnapshot &&
      issue.fundingSnapshot.fundingTargetPaise > 0 &&
      (issue.fundingSnapshot.amountRaisedPaise || 0) >= issue.fundingSnapshot.fundingTargetPaise
    ) {
      throw new ApiError(
        HttpStatusCode.BAD_REQUEST,
        "The funding target for this project has already been achieved."
      );
    }

    // If local donation is already SUCCEEDED, do not re-charge
    if (donation.status === DonationStatus.SUCCEEDED) {
      return {
        status: "ALREADY_SUCCEEDED",
        donationId: donation.id,
        paymentIntentId: donation.stripePaymentIntentId,
        amountPaise: donation.amountPaise,
        currency: donation.currency,
        message: "Payment for this donation has already been verified and succeeded.",
      };
    }

    // If no PaymentIntent was previously associated (e.g. initial network failure)
    if (!donation.stripePaymentIntentId) {
      const idempotencyKey = `don_init_retry_${donation.id}`;
      const newPi = await this._stripeService.createPaymentIntent({
        amountPaise: donation.amountPaise,
        currency: donation.currency,
        metadata: {
          donationId: donation.id,
          issueId: donation.issueId,
          userId: donation.userId,
          isAnonymous: String(donation.isAnonymous),
        },
        idempotencyKey,
      });

      await this._donationRepository.updatePaymentIntentId(donation.id, null, newPi.id);

      return {
        status: "READY_FOR_PAYMENT",
        donationId: donation.id,
        paymentIntentId: newPi.id,
        clientSecret: newPi.client_secret || undefined,
        amountPaise: donation.amountPaise,
        currency: donation.currency,
      };
    }

    // Retrieve current Stripe PaymentIntent
    const pi = await this._stripeService.retrievePaymentIntent(donation.stripePaymentIntentId);

    switch (pi.status) {
      case "requires_payment_method":
      case "requires_action":
      case "requires_confirmation": {
        // Reuse existing PaymentIntent and return its client secret
        if (donation.status === DonationStatus.FAILED) {
          await this._donationRepository.updateStatus(donation.id, DonationStatus.PENDING);
        }

        return {
          status: "READY_FOR_PAYMENT",
          donationId: donation.id,
          paymentIntentId: pi.id,
          clientSecret: pi.client_secret || undefined,
          amountPaise: donation.amountPaise,
          currency: donation.currency,
        };
      }

      case "processing": {
        // Payment is currently processing at Stripe; do not create duplicate
        if (donation.status !== DonationStatus.PROCESSING) {
          await this._donationRepository.updateStatus(donation.id, DonationStatus.PROCESSING);
        }

        return {
          status: "PROCESSING",
          donationId: donation.id,
          paymentIntentId: pi.id,
          amountPaise: donation.amountPaise,
          currency: donation.currency,
          message: "Payment is currently processing. Confirmation pending from payment network.",
        };
      }

      case "succeeded": {
        // Webhook remains responsible for confirming and updating issue funding
        return {
          status: "ALREADY_SUCCEEDED",
          donationId: donation.id,
          paymentIntentId: pi.id,
          amountPaise: donation.amountPaise,
          currency: donation.currency,
          message: "Payment has already succeeded at payment provider. Confirmation pending.",
        };
      }

      case "canceled": {
        // Create replacement PaymentIntent with stable idempotency key tied to previous PI
        const idempotencyKey = `don_rep_${donation.id}_${pi.id}`;
        const newPi = await this._stripeService.createPaymentIntent({
          amountPaise: donation.amountPaise,
          currency: donation.currency,
          metadata: {
            donationId: donation.id,
            issueId: donation.issueId,
            userId: donation.userId,
            isAnonymous: String(donation.isAnonymous),
          },
          idempotencyKey,
        });

        await this._donationRepository.updatePaymentIntentId(donation.id, pi.id, newPi.id);
        await this._donationRepository.updateStatus(donation.id, DonationStatus.PENDING);

        return {
          status: "READY_FOR_PAYMENT",
          donationId: donation.id,
          paymentIntentId: newPi.id,
          clientSecret: newPi.client_secret || undefined,
          amountPaise: donation.amountPaise,
          currency: donation.currency,
        };
      }

      default: {
        return {
          status: "NOT_RETRYABLE",
          donationId: donation.id,
          paymentIntentId: pi.id,
          amountPaise: donation.amountPaise,
          currency: donation.currency,
          message: `Payment cannot be retried in current status: ${pi.status}`,
        };
      }
    }
  }
}
