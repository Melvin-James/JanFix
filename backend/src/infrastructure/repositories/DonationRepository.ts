import { Types, type ClientSession, type QueryOptions } from "mongoose";
import type {
  IDonationRepository,
  PaginatedDonations,
} from "../../domain/interface/IDonationRepository.ts";
import type { Donation } from "../../domain/entities/Donation.ts";
import { DonationStatus } from "../../domain/enums/DonationStatus.ts";
import { DonationModel } from "../models/DonationModel.ts";
import { DonationMapper } from "../mappers/DonationMapper.ts";

export class DonationRepository implements IDonationRepository {
  async create(
    donation: Partial<Donation>,
    session?: ClientSession
  ): Promise<Donation> {
    const docData = {
      issueId: new Types.ObjectId(donation.issueId),
      userId: new Types.ObjectId(donation.userId),
      donorName: donation.donorName ?? "",
      donorEmail: donation.donorEmail ?? undefined,
      amountPaise: donation.amountPaise ?? 0,
      currency: donation.currency || "inr",
      status: donation.status || DonationStatus.PENDING,
      paymentProvider: donation.paymentProvider,
      stripePaymentIntentId: donation.stripePaymentIntentId ?? undefined,
      isAnonymous: donation.isAnonymous ?? false,
      message: donation.message ?? undefined,
      failureReason: donation.failureReason ?? undefined,
      paidAt: donation.paidAt ?? undefined,
    };

    const doc = new DonationModel(docData);
    const saved = session ? await doc.save({ session }) : await doc.save();
    return DonationMapper.toEntity(saved);
  }

  async findById(id: string): Promise<Donation | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await DonationModel.findById(id);
    return doc ? DonationMapper.toEntity(doc) : null;
  }

  async findByPaymentIntentId(paymentIntentId: string): Promise<Donation | null> {
    const doc = await DonationModel.findOne({ stripePaymentIntentId: paymentIntentId });
    return doc ? DonationMapper.toEntity(doc) : null;
  }

  async updateStatus(
    id: string,
    status: DonationStatus,
    extra?: {
      paidAt?: Date | undefined;
      failureReason?: string | undefined;
      stripePaymentIntentId?: string | undefined;
    },
    session?: ClientSession
  ): Promise<Donation | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const updateFields: Record<string, unknown> = { status };
    if (extra?.paidAt !== undefined) updateFields.paidAt = extra.paidAt;
    if (extra?.failureReason !== undefined) updateFields.failureReason = extra.failureReason;
    if (extra?.stripePaymentIntentId !== undefined) updateFields.stripePaymentIntentId = extra.stripePaymentIntentId;

    const options: QueryOptions = { returnDocument: "after" };
    if (session) {
      options.session = session;
    }

    const updated = await DonationModel.findByIdAndUpdate(
      id,
      { $set: updateFields },
      options
    );

    return updated ? DonationMapper.toEntity(updated) : null;
  }

  async markSucceededIfNotSucceeded(
    id: string,
    paymentIntentId: string,
    paidAt: Date,
    session?: ClientSession
  ): Promise<Donation | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const options: QueryOptions = { returnDocument: "after" };
    if (session) {
      options.session = session;
    }

    const updated = await DonationModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        stripePaymentIntentId: paymentIntentId,
        status: { $ne: DonationStatus.SUCCEEDED },
      },
      {
        $set: {
          status: DonationStatus.SUCCEEDED,
          paidAt,
        },
      },
      options
    );

    return updated ? DonationMapper.toEntity(updated) : null;
  }

  async updateStatusIfNotSucceeded(
    id: string,
    paymentIntentId: string,
    status: DonationStatus,
    extra?: {
      failureReason?: string;
    },
    session?: ClientSession
  ): Promise<Donation | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const updateFields: Record<string, unknown> = { status };
    if (extra?.failureReason !== undefined) updateFields.failureReason = extra.failureReason;

    const options: QueryOptions = { returnDocument: "after" };
    if (session) {
      options.session = session;
    }

    const updated = await DonationModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        stripePaymentIntentId: paymentIntentId,
        status: { $ne: DonationStatus.SUCCEEDED },
      },
      {
        $set: updateFields,
      },
      options
    );

    return updated ? DonationMapper.toEntity(updated) : null;
  }

  async updatePaymentIntentId(
    id: string,
    expectedCurrentPaymentIntentId: string | null,
    newPaymentIntentId: string,
    session?: ClientSession
  ): Promise<Donation | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const query: Record<string, unknown> = {
      _id: new Types.ObjectId(id),
      status: { $ne: DonationStatus.SUCCEEDED },
    };

    if (expectedCurrentPaymentIntentId === null) {
      query.stripePaymentIntentId = { $in: [null, undefined] };
    } else {
      query.stripePaymentIntentId = expectedCurrentPaymentIntentId;
    }

    const options: QueryOptions = { returnDocument: "after" };
    if (session) {
      options.session = session;
    }

    const updated = await DonationModel.findOneAndUpdate(
      query,
      {
        $set: {
          stripePaymentIntentId: newPaymentIntentId,
        },
      },
      options
    );

    return updated ? DonationMapper.toEntity(updated) : null;
  }

  async findSuccessfulByIssueId(
    issueId: string,
    page: number,
    pageSize: number
  ): Promise<PaginatedDonations> {
    if (!Types.ObjectId.isValid(issueId)) {
      return {
        donations: [],
        total: 0,
        page: 1,
        pageSize,
        totalPages: 1,
      };
    }

    const safePage = Math.max(1, page);
    const safePageSize = Math.max(1, Math.min(pageSize, 50));
    const skip = (safePage - 1) * safePageSize;

    const query = {
      issueId: new Types.ObjectId(issueId),
      status: DonationStatus.SUCCEEDED,
    };

    const [docs, total] = await Promise.all([
      DonationModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safePageSize),
      DonationModel.countDocuments(query),
    ]);

    return {
      donations: docs.map((doc) => DonationMapper.toEntity(doc)),
      total,
      page: safePage,
      pageSize: safePageSize,
      totalPages: Math.ceil(total / safePageSize) || 1,
    };
  }

  async findSuccessfulDonorsSummary(
    issueId: string
  ): Promise<{ totalAmountPaise: number; donorCount: number }> {
    if (!Types.ObjectId.isValid(issueId)) {
      return { totalAmountPaise: 0, donorCount: 0 };
    }

    const result = await DonationModel.aggregate([
      {
        $match: {
          issueId: new Types.ObjectId(issueId),
          status: DonationStatus.SUCCEEDED,
        },
      },
      {
        $group: {
          _id: null,
          totalAmountPaise: { $sum: "$amountPaise" },
          donorCount: { $sum: 1 },
        },
      },
    ]);

    if (!result || result.length === 0) {
      return { totalAmountPaise: 0, donorCount: 0 };
    }

    return {
      totalAmountPaise: result[0].totalAmountPaise || 0,
      donorCount: result[0].donorCount || 0,
    };
  }
}
