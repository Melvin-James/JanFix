import mongoose from "mongoose";
import type Stripe from "stripe";
import type { IDonationRepository } from "../../../domain/interface/IDonationRepository.js";
import type { IIssueRepository } from "../../../domain/interface/IIssueRepository.js";
import type { StripeService } from "../../../infrastructure/services/StripeService.js";
import { DonationStatus } from "../../../domain/enums/DonationStatus.js";
import type { Donation } from "../../../domain/entities/Donation.js";
import logger from "../../../shared/utils/logger.js";

export class HandleStripeWebhookUseCase {
  constructor(
    private donationRepository: IDonationRepository,
    private issueRepository: IIssueRepository,
    private stripeService: StripeService
  ) {}

  async execute(
    rawBody: Buffer | string,
    signature: string | undefined
  ): Promise<{ received: boolean }> {
    if (!signature) {
      throw new Error("Missing stripe-signature header");
    }

    const event = this.stripeService.constructWebhookEvent(rawBody, signature);

    logger.info(`Received Stripe webhook event: ${event.type} [${event.id}]`);

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentIntentSucceeded(paymentIntent);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentIntentFailed(paymentIntent);
        break;
      }

      case "payment_intent.canceled": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentIntentCanceled(paymentIntent);
        break;
      }

      default:
        logger.info(`Unhandled Stripe webhook event type: ${event.type}`);
        break;
    }

    return { received: true };
  }

  /**
   * Correlates and strictly validates the incoming Stripe PaymentIntent against the internal Donation entity.
   * Defends against:
   * 1. Amount or currency tampering/mismatch.
   * 2. Issue or Donation ID metadata mismatch.
   * 3. Stale events from an old canceled PaymentIntent after a replacement PaymentIntent was issued.
   * 4. Creation race conditions where the initial PaymentIntentId wasn't yet persisted.
   */
  private async findAndValidateDonation(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<Donation | null> {
    let donation = await this.donationRepository.findByPaymentIntentId(paymentIntent.id);

    // Handle creation race condition: initial intent ID may not be persisted yet
    if (!donation) {
      const donationIdFromMeta = paymentIntent.metadata?.donationId;
      if (!donationIdFromMeta) {
        logger.warn(
          `No donation found for Stripe PaymentIntent ${paymentIntent.id} and no metadata donationId provided.`
        );
        return null;
      }

      const candidate = await this.donationRepository.findById(donationIdFromMeta);
      if (!candidate) {
        logger.warn(
          `Donation ID ${donationIdFromMeta} from PaymentIntent ${paymentIntent.id} metadata does not exist.`
        );
        return null;
      }

      // If candidate already has a DIFFERENT PaymentIntent ID, this incoming event is stale/replaced
      if (
        candidate.stripePaymentIntentId &&
        candidate.stripePaymentIntentId !== paymentIntent.id
      ) {
        logger.warn(
          `Ignoring stale PaymentIntent ${paymentIntent.id}: donation ${candidate.id} is currently associated with ${candidate.stripePaymentIntentId}`
        );
        return null;
      }

      // Associate incoming PaymentIntent ID only if candidate currently has no associated ID
      if (!candidate.stripePaymentIntentId) {
        const associated = await this.donationRepository.updatePaymentIntentId(
          candidate.id,
          null,
          paymentIntent.id
        );
        if (!associated) {
          logger.warn(
            `Could not associate PaymentIntent ${paymentIntent.id} with donation ${candidate.id} due to concurrent update.`
          );
          return null;
        }
        candidate.stripePaymentIntentId = paymentIntent.id;
      }

      donation = candidate;
    }

    // Strict validation of PaymentIntent properties against Donation
    if (donation.stripePaymentIntentId !== paymentIntent.id) {
      logger.warn(
        `PaymentIntent ID mismatch for donation ${donation.id}: expected ${donation.stripePaymentIntentId}, received ${paymentIntent.id}`
      );
      return null;
    }

    if (paymentIntent.amount !== donation.amountPaise) {
      logger.warn(
        `PaymentIntent amount mismatch for donation ${donation.id}: expected ${donation.amountPaise} paise, received ${paymentIntent.amount} paise`
      );
      return null;
    }

    if (paymentIntent.currency.toLowerCase() !== donation.currency.toLowerCase()) {
      logger.warn(
        `PaymentIntent currency mismatch for donation ${donation.id}: expected ${donation.currency}, received ${paymentIntent.currency}`
      );
      return null;
    }

    if (
      paymentIntent.metadata?.donationId &&
      paymentIntent.metadata.donationId !== donation.id
    ) {
      logger.warn(
        `PaymentIntent metadata donationId mismatch: expected ${donation.id}, received ${paymentIntent.metadata.donationId}`
      );
      return null;
    }

    if (
      paymentIntent.metadata?.issueId &&
      paymentIntent.metadata.issueId !== donation.issueId
    ) {
      logger.warn(
        `PaymentIntent metadata issueId mismatch: expected ${donation.issueId}, received ${paymentIntent.metadata.issueId}`
      );
      return null;
    }

    return donation;
  }

  private async handlePaymentIntentSucceeded(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    const donation = await this.findAndValidateDonation(paymentIntent);
    if (!donation) {
      return;
    }

    // Idempotency: If already SUCCEEDED, do nothing
    if (donation.status === DonationStatus.SUCCEEDED) {
      logger.info(
        `Donation ${donation.id} is already marked SUCCEEDED. Idempotently ignoring webhook.`
      );
      return;
    }

    const paidAt = new Date(
      (paymentIntent.created || Math.floor(Date.now() / 1000)) * 1000
    );

    // Atomically transition donation and increment issue funding inside a single MongoDB session
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      // Conditional atomic update: only succeeds if status != SUCCEEDED
      const updated = await this.donationRepository.markSucceededIfNotSucceeded(
        donation.id,
        paymentIntent.id,
        paidAt,
        session
      );

      if (updated) {
        // Only increment funding if this execution actually transitioned the record
        await this.issueRepository.incrementRaisedAmount(
          donation.issueId,
          donation.amountPaise,
          session
        );

        logger.info(
          `Successfully processed donation ${donation.id} for issue ${donation.issueId} (+${donation.amountPaise} paise) via atomic transaction.`
        );
      } else {
        logger.info(
          `Donation ${donation.id} was already transitioned concurrently. Skipping issue funding increment.`
        );
      }

      await session.commitTransaction();
    } catch (txError) {
      await session.abortTransaction();
      logger.error(
        `Transaction failed for donation ${donation.id}: ${(txError as Error)?.message}`
      );
      // Re-throw so Stripe receives a 4xx/5xx and retries webhook delivery
      throw txError;
    } finally {
      session.endSession();
    }
  }

  private async handlePaymentIntentFailed(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    const donation = await this.findAndValidateDonation(paymentIntent);
    if (!donation) return;

    if (donation.status === DonationStatus.SUCCEEDED) {
      logger.warn(
        `Ignoring payment_failed event for donation ${donation.id} because it has already SUCCEEDED.`
      );
      return;
    }

    const failureReason =
      paymentIntent.last_payment_error?.message || "Payment processing failed";

    await this.donationRepository.updateStatusIfNotSucceeded(
      donation.id,
      paymentIntent.id,
      DonationStatus.FAILED,
      { failureReason }
    );

    logger.warn(`Donation ${donation.id} marked as FAILED: ${failureReason}`);
  }

  private async handlePaymentIntentCanceled(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    const donation = await this.findAndValidateDonation(paymentIntent);
    if (!donation) return;

    if (donation.status === DonationStatus.SUCCEEDED) {
      logger.warn(
        `Ignoring canceled event for donation ${donation.id} because it has already SUCCEEDED.`
      );
      return;
    }

    await this.donationRepository.updateStatusIfNotSucceeded(
      donation.id,
      paymentIntent.id,
      DonationStatus.CANCELED,
      { failureReason: "Payment was canceled by user or expired." }
    );

    logger.info(`Donation ${donation.id} marked as CANCELED`);
  }
}
