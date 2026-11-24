import { Schema, model, type Document, Types } from "mongoose";
import { DonationStatus } from "../../domain/enums/DonationStatus.ts";
import { PaymentProvider } from "../../domain/enums/PaymentProvider.ts";

export interface DonationDocument extends Document<Types.ObjectId> {
  issueId: Types.ObjectId;
  userId: Types.ObjectId;
  donorName: string;
  donorEmail?: string;
  amountPaise: number;
  currency: string;
  status: DonationStatus;
  paymentProvider: PaymentProvider;
  stripePaymentIntentId?: string;
  isAnonymous: boolean;
  message?: string;
  failureReason?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const donationSchema = new Schema<DonationDocument>(
  {
    issueId: {
      type: Schema.Types.ObjectId,
      ref: "Issue",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    donorName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    donorEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    amountPaise: {
      type: Number,
      required: true,
      min: 100, // minimum ₹1.00 = 100 paise
    },
    currency: {
      type: String,
      required: true,
      default: "inr",
      lowercase: true,
    },
    status: {
      type: String,
      enum: Object.values(DonationStatus),
      default: DonationStatus.PENDING,
      required: true,
      index: true,
    },
    paymentProvider: {
      type: String,
      enum: Object.values(PaymentProvider),
      default: PaymentProvider.STRIPE,
      required: true,
    },
    stripePaymentIntentId: {
      type: String,
      sparse: true,
      unique: true,
      index: true,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
      required: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    failureReason: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
donationSchema.index({ issueId: 1, status: 1, createdAt: -1 });
donationSchema.index({ userId: 1, createdAt: -1 });

export const DonationModel = model<DonationDocument>("Donation", donationSchema);
