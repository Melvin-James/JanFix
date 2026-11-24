import type { Document } from "mongoose";
import type { Donation } from "../../domain/entities/Donation.ts";
import type { DonationDocument } from "../models/DonationModel.ts";

export class DonationMapper {
  public static toEntity(doc: Document | DonationDocument): Donation {
    const d = doc as DonationDocument;
    return {
      id: d._id.toString(),
      issueId: d.issueId.toString(),
      userId: d.userId.toString(),
      donorName: d.donorName,
      donorEmail: d.donorEmail ?? undefined,
      amountPaise: d.amountPaise,
      currency: d.currency,
      status: d.status,
      paymentProvider: d.paymentProvider,
      stripePaymentIntentId: d.stripePaymentIntentId ?? undefined,
      isAnonymous: d.isAnonymous,
      message: d.message ?? undefined,
      failureReason: d.failureReason ?? undefined,
      paidAt: d.paidAt ?? undefined,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    };
  }
}
