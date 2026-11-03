import { Types } from "mongoose";
import type { IIssueInterestRepository } from "../../domain/interface/IIssueInterestRepository.js";
import type { IssueInterest } from "../../domain/entities/IssueInterest.js";
import { IssueInterestModel } from "../models/IssueInterestModel.js";

export class IssueInterestRepository implements IIssueInterestRepository {
    async create(issueId: string, providerId: string): Promise<IssueInterest> {
        const doc = await IssueInterestModel.create({
            issueId: new Types.ObjectId(issueId),
            providerId: new Types.ObjectId(providerId),
        });

        return {
            id: doc._id.toString(),
            issueId: doc.issueId.toString(),
            providerId: doc.providerId.toString(),
            createdAt: doc.createdAt,
        };
    }

    async exists(issueId: string, providerId: string): Promise<boolean> {
        const doc = await IssueInterestModel.exists({
            issueId: new Types.ObjectId(issueId),
            providerId: new Types.ObjectId(providerId),
        });
        return Boolean(doc);
    }

    async findInterestsByProvider(providerId: string): Promise<string[]> {
        const docs = await IssueInterestModel.find({
            providerId: new Types.ObjectId(providerId),
        }).select("issueId").lean();

        return docs.map((d) => d.issueId.toString());
    }

    async countByIssue(issueId: string): Promise<number> {
        return await IssueInterestModel.countDocuments({
            issueId: new Types.ObjectId(issueId),
        });
    }
}

export default IssueInterestRepository;
