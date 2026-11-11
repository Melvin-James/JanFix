import { Types } from "mongoose";
import type { IProposalRepository } from "../../domain/interface/IProposalRepository.js";
import type { Proposal } from "../../domain/entities/Proposal.js";
import { ProposalModel } from "../models/ProposalModel.js";
import { ProposalMapper } from "../mappers/ProposalMapper.js";
import { ProposalStatus } from "../../domain/enums/ProposalStatus.js";

export class ProposalRepository implements IProposalRepository {
    async create(proposal: Omit<Proposal, "id" | "createdAt" | "updatedAt">): Promise<Proposal> {
        const createDoc: Record<string, unknown> = {
            issueId: new Types.ObjectId(proposal.issueId),
            providerId: new Types.ObjectId(proposal.providerId),
            providerType: proposal.providerType,
            status: proposal.status,
            issueSnapshot: proposal.issueSnapshot,
            estimatedTeamSize: proposal.estimatedTeamSize,
            estimatedDurationHours: proposal.estimatedDurationHours,
            budgetItems: proposal.budgetItems.map((item) => ({
                ...(item.id && Types.ObjectId.isValid(item.id) ? { _id: new Types.ObjectId(item.id) } : {}),
                heading: item.heading,
                amountPaise: item.amountPaise,
            })),
            totalBudgetPaise: proposal.totalBudgetPaise,
            executionRoadmap: proposal.executionRoadmap.map((item, idx) => ({
                ...(item.id && Types.ObjectId.isValid(item.id) ? { _id: new Types.ObjectId(item.id) } : {}),
                heading: item.heading,
                description: item.description,
                startTime: item.startTime,
                endTime: item.endTime,
                order: item.order ?? idx,
            })),
            submittedAt: proposal.submittedAt,
        };

        if (proposal.ngoDetails) {
            const ngoDoc: Record<string, unknown> = {
                requiresFunding: proposal.ngoDetails.requiresFunding,
                participationMode: proposal.ngoDetails.participationMode,
                requiresCommunityChat: proposal.ngoDetails.requiresCommunityChat,
            };
            if (proposal.ngoDetails.expectedParticipants !== undefined) {
                ngoDoc.expectedParticipants = proposal.ngoDetails.expectedParticipants;
            }
            createDoc.ngoDetails = ngoDoc;
        }

        if (proposal.withdrawnAt !== undefined) {
            createDoc.withdrawnAt = proposal.withdrawnAt;
        }

        const doc = await ProposalModel.create(createDoc);

        return ProposalMapper.toEntity(doc);
    }

    async findById(id: string): Promise<Proposal | null> {
        if (!Types.ObjectId.isValid(id)) return null;
        const doc = await ProposalModel.findById(id);
        return doc ? ProposalMapper.toEntity(doc) : null;
    }

    async findByIssueAndProvider(issueId: string, providerId: string): Promise<Proposal | null> {
        if (!Types.ObjectId.isValid(issueId) || !Types.ObjectId.isValid(providerId)) return null;
        const doc = await ProposalModel.findOne({
            issueId: new Types.ObjectId(issueId),
            providerId: new Types.ObjectId(providerId),
        });
        return doc ? ProposalMapper.toEntity(doc) : null;
    }

    async update(id: string, updates: Partial<Proposal>): Promise<Proposal | null> {
        if (!Types.ObjectId.isValid(id)) return null;

        const updateData: Record<string, unknown> = { ...updates };
        if (updates.budgetItems) {
            updateData.budgetItems = updates.budgetItems.map((item) => ({
                ...(item.id && Types.ObjectId.isValid(item.id) ? { _id: new Types.ObjectId(item.id) } : {}),
                heading: item.heading,
                amountPaise: item.amountPaise,
            }));
        }
        if (updates.executionRoadmap) {
            updateData.executionRoadmap = updates.executionRoadmap.map((item, idx) => ({
                ...(item.id && Types.ObjectId.isValid(item.id) ? { _id: new Types.ObjectId(item.id) } : {}),
                heading: item.heading,
                description: item.description,
                startTime: item.startTime,
                endTime: item.endTime,
                order: item.order ?? idx,
            }));
        }

        const doc = await ProposalModel.findByIdAndUpdate(
            id,
            updateData,
            { returnDocument: "after", runValidators: true }
        );
        return doc ? ProposalMapper.toEntity(doc) : null;
    }

    async updateByIssueAndProvider(
        issueId: string,
        providerId: string,
        updates: Partial<Proposal>
    ): Promise<Proposal | null> {
        if (!Types.ObjectId.isValid(issueId) || !Types.ObjectId.isValid(providerId)) return null;

        const updateData: Record<string, unknown> = { ...updates };
        if (updates.budgetItems) {
            updateData.budgetItems = updates.budgetItems.map((item) => ({
                ...(item.id && Types.ObjectId.isValid(item.id) ? { _id: new Types.ObjectId(item.id) } : {}),
                heading: item.heading,
                amountPaise: item.amountPaise,
            }));
        }
        if (updates.executionRoadmap) {
            updateData.executionRoadmap = updates.executionRoadmap.map((item, idx) => ({
                ...(item.id && Types.ObjectId.isValid(item.id) ? { _id: new Types.ObjectId(item.id) } : {}),
                heading: item.heading,
                description: item.description,
                startTime: item.startTime,
                endTime: item.endTime,
                order: item.order ?? idx,
            }));
        }

        const doc = await ProposalModel.findOneAndUpdate(
            {
                issueId: new Types.ObjectId(issueId),
                providerId: new Types.ObjectId(providerId),
            },
            updateData,
            { returnDocument: "after", runValidators: true }
        );
        return doc ? ProposalMapper.toEntity(doc) : null;
    }

    async countSubmittedByIssue(issueId: string): Promise<number> {
        if (!Types.ObjectId.isValid(issueId)) return 0;
        return await ProposalModel.countDocuments({
            issueId: new Types.ObjectId(issueId),
            status: ProposalStatus.SUBMITTED,
        });
    }

    async countSubmittedForIssues(issueIds: string[]): Promise<Map<string, number>> {
        const validIds = issueIds.filter((id) => Types.ObjectId.isValid(id)).map((id) => new Types.ObjectId(id));
        if (validIds.length === 0) return new Map();

        const results = await ProposalModel.aggregate([
            {
                $match: {
                    issueId: { $in: validIds },
                    status: ProposalStatus.SUBMITTED,
                },
            },
            {
                $group: {
                    _id: "$issueId",
                    count: { $sum: 1 },
                },
            },
        ]);

        const map = new Map<string, number>();
        for (const item of results) {
            map.set(item._id.toString(), item.count);
        }
        return map;
    }

    async findSubmittedIssueIdsByProvider(providerId: string, issueIds: string[]): Promise<string[]> {
        if (!Types.ObjectId.isValid(providerId)) return [];
        const validIds = issueIds.filter((id) => Types.ObjectId.isValid(id)).map((id) => new Types.ObjectId(id));
        if (validIds.length === 0) return [];

        const docs = await ProposalModel.find({
            providerId: new Types.ObjectId(providerId),
            issueId: { $in: validIds },
            status: ProposalStatus.SUBMITTED,
        }).select("issueId").lean();

        return docs.map((d) => d.issueId.toString());
    }
}

export default ProposalRepository;
