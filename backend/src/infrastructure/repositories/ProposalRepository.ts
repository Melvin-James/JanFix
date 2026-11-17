import { Types } from "mongoose";
import type {
    IProposalRepository,
    IssueWithProposalsFilters,
    IssueWithProposalsAggregateItem,
} from "../../domain/interface/IProposalRepository.js";
import type { Proposal } from "../../domain/entities/Proposal.js";
import type { PaginatedResult } from "../../shared/types/Pagination.js";
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

    async findSubmittedByIssueId(issueId: string): Promise<Proposal[]> {
        if (!Types.ObjectId.isValid(issueId)) return [];
        const docs = await ProposalModel.find({
            issueId: new Types.ObjectId(issueId),
            status: ProposalStatus.SUBMITTED,
        }).sort({ submittedAt: -1 });

        return docs.map(ProposalMapper.toEntity);
    }

    async findByIdAndIssueId(id: string, issueId: string): Promise<Proposal | null> {
        if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(issueId)) return null;
        const doc = await ProposalModel.findOne({
            _id: new Types.ObjectId(id),
            issueId: new Types.ObjectId(issueId),
            status: ProposalStatus.SUBMITTED,
        });
        return doc ? ProposalMapper.toEntity(doc) : null;
    }

    async findIssuesWithProposals(
        page = 1,
        pageSize = 10,
        filters?: IssueWithProposalsFilters
    ): Promise<PaginatedResult<IssueWithProposalsAggregateItem>> {
        const safePage = Number.isInteger(page) && page > 0 ? page : 1;
        const safePageSize = Number.isInteger(pageSize) && pageSize > 0 ? Math.min(pageSize, 100) : 10;
        const skip = (safePage - 1) * safePageSize;

        // Step 1: Match active submitted proposals
        const matchStage: Record<string, unknown> = {
            status: ProposalStatus.SUBMITTED,
        };

        // Step 2: Group by issueId to get counts, latest submission, and provider IDs
        const groupStage = {
            $group: {
                _id: "$issueId",
                proposalCount: { $sum: 1 },
                latestProposalSubmittedAt: { $max: "$submittedAt" },
                providerIds: { $addToSet: "$providerId" },
            },
        };

        // Step 3: Lookup issue details
        const lookupIssueStage = {
            $lookup: {
                from: "issues",
                localField: "_id",
                foreignField: "_id",
                as: "issueDoc",
            },
        };

        const unwindIssueStage = {
            $unwind: "$issueDoc",
        };

        // Step 4: Lookup category
        const lookupCategoryStage = {
            $lookup: {
                from: "categories",
                localField: "issueDoc.category",
                foreignField: "_id",
                as: "categoryDocs",
            },
        };

        // Step 5: Lookup providers (for names and avatars)
        const lookupProvidersStage = {
            $lookup: {
                from: "users",
                localField: "providerIds",
                foreignField: "_id",
                as: "providerDocs",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            fullName: 1,
                            "providerProfile.identity.providerName": 1,
                            "providerProfile.identity.providerType": 1,
                            "providerProfile.documents.profileImage": 1,
                            "providerProfile.documents.logo": 1,
                        },
                    },
                ],
            },
        };

        // Step 6: Post-lookup filtering (search, category)
        const postFilterMatch: Record<string, unknown> = {};

        if (filters?.category && filters.category !== "ALL") {
            if (Types.ObjectId.isValid(filters.category)) {
                postFilterMatch["issueDoc.category"] = new Types.ObjectId(filters.category);
            }
        }

        if (filters?.search && filters.search.trim().length > 0) {
            const escaped = filters.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            postFilterMatch["issueDoc.title"] = { $regex: escaped, $options: "i" };
        }

        // Step 7: Sorting
        let sortStage: Record<string, 1 | -1> = { proposalCount: -1, "issueDoc.createdAt": -1 };
        if (filters?.sortBy === "proposals_asc") {
            sortStage = { proposalCount: 1, "issueDoc.createdAt": -1 };
        } else if (filters?.sortBy === "newest") {
            sortStage = { "issueDoc.createdAt": -1 };
        } else if (filters?.sortBy === "oldest") {
            sortStage = { "issueDoc.createdAt": 1 };
        }

        // Build pipeline with facet
        const pipeline: any[] = [
            { $match: matchStage },
            groupStage,
            lookupIssueStage,
            unwindIssueStage,
            lookupCategoryStage,
            lookupProvidersStage,
        ];

        if (Object.keys(postFilterMatch).length > 0) {
            pipeline.push({ $match: postFilterMatch });
        }

        pipeline.push({
            $facet: {
                metadata: [{ $count: "total" }],
                data: [
                    { $sort: sortStage },
                    { $skip: skip },
                    { $limit: safePageSize },
                    {
                        $project: {
                            _id: 0,
                            proposalCount: 1,
                            latestProposalSubmittedAt: 1,
                            issue: {
                                _id: { $toString: "$issueDoc._id" },
                                title: "$issueDoc.title",
                                description: "$issueDoc.description",
                                category: {
                                    $cond: {
                                        if: { $gt: [{ $size: "$categoryDocs" }, 0] },
                                        then: {
                                            _id: { $toString: { $arrayElemAt: ["$categoryDocs._id", 0] } },
                                            name: { $arrayElemAt: ["$categoryDocs.name", 0] },
                                        },
                                        else: null,
                                    },
                                },
                                location: "$issueDoc.location",
                                images: "$issueDoc.images",
                                status: "$issueDoc.status",
                                proposalWindowStatus: "$issueDoc.proposalWindowStatus",
                                proposalDeadlineAt: "$issueDoc.proposalDeadlineAt",
                                proposalOpenedAt: "$issueDoc.proposalOpenedAt",
                                createdAt: "$issueDoc.createdAt",
                                updatedAt: "$issueDoc.updatedAt",
                            },
                            providers: {
                                $map: {
                                    input: "$providerDocs",
                                    as: "p",
                                    in: {
                                        _id: { $toString: "$$p._id" },
                                        fullName: "$$p.fullName",
                                        providerProfile: "$$p.providerProfile",
                                    },
                                },
                            },
                        },
                    },
                ],
            },
        });

        const [result] = await ProposalModel.aggregate(pipeline);
        const totalItems = result?.metadata?.[0]?.total || 0;
        const items: IssueWithProposalsAggregateItem[] = result?.data || [];

        return {
            items,
            pagination: {
                totalItems,
                page: safePage,
                pageSize: safePageSize,
                totalPages: Math.ceil(totalItems / safePageSize) || 1,
            },
        };
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
