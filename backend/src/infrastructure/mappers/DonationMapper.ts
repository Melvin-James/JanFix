import type { Donation } from "../../domain/entities/Donation.js";
import type { DonationDocument } from "../models/DonationModel.js";

export class DonationMapper {
  public static toEntity(doc: DonationDocument): Donation {
    return {
      id: doc._id.toString(),
      issueId: doc.issueId.toString(),
      userId: doc.userId.toString(),
      donorName: doc.donorName,
      donorEmail: doc.donorEmail ?? undefined,
      amountPaise: doc.amountPaise,
      currency: doc.currency,
      status: doc.status,
      paymentProvider: doc.paymentProvider,
      stripePaymentIntentId: doc.stripePaymentIntentId ?? undefined,
      isAnonymous: doc.isAnonymous,
      message: doc.message ?? undefined,
      failureReason: doc.failureReason ?? undefined,
      paidAt: doc.paidAt ?? undefined,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
