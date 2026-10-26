import { Types, type QueryFilter } from "mongoose";
import type { IIssueRepository, IssueFilters, AdminIssueFilters, ReviewEligibleIssueItem } from "../../domain/interface/IIssueRepository.js";
import type { Issue } from "../../domain/entities/Issue.js";
import { IssueModel, type IssueDocument } from "../models/IssueModel.js";
import { IssueVoteModel } from "../models/IssueVoteModel.js";
import { IssueCommentModel } from "../models/IssueCommentModel.js";
import { BaseRepository } from "./base/BaseRepository.js";
import { IssueMapper } from "../mappers/IssueMapper.js";
import type { PaginatedResult } from "../../shared/types/Pagination.js";
import { IssueStatus } from "../../domain/enums/IssueStatus.js";
import { IssueVisibility } from "../../domain/enums/IssueVisibility.js";
import { getReviewEligibilityThreshold } from "../../shared/utils/issueEligibility.js";

type IssueFilter = QueryFilter<IssueDocument>;

export class IssueRepository extends BaseRepository<Issue> implements IIssueRepository {
    constructor() {
        super(IssueModel, IssueMapper.toEntity);
    }

    async findByUserId(
        userId: string,
        page: number,
        pageSize: number,
        filters?: IssueFilters
    ): Promise<PaginatedResult<Issue>> {
        const safePage = Number.isInteger(page) && page > 0 ? page : 1;
        const safePageSize = Number.isInteger(pageSize) && pageSize > 0 ? Math.min(pageSize, 100) : 10;

        const query: IssueFilter = { createdBy: new Types.ObjectId(userId) };

        if (filters?.status && filters.status !== "ALL") {
            const requestedStatus = filters.status.toString().toUpperCase();
            query.status = requestedStatus as IssueStatus;
        }

        if (filters?.visibility && filters.visibility !== "ALL") {
            const requestedVisibility = filters.visibility.toString().toUpperCase();
            query.visibility = requestedVisibility as IssueVisibility;
        }

        if (filters?.category && filters.category !== "ALL") {
            if (Types.ObjectId.isValid(filters.category)) {
                query.category = new Types.ObjectId(filters.category);
            }
        }

        if (filters?.search && filters.search.trim().length > 0) {
            const escaped = filters.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            query.$or = [
                { title: { $regex: escaped, $options: "i" } },
                { description: { $regex: escaped, $options: "i" } },
            ];
        }

        const skip = (safePage - 1) * safePageSize;

        const [items, totalItems] = await Promise.all([
            IssueModel.find(query).populate("category").sort({ createdAt: -1, _id: -1 }).skip(skip).limit(safePageSize),
            IssueModel.countDocuments(query),
        ]);

        return {
            items: items.map(IssueMapper.toEntity),
            pagination: {
                totalItems,
                page: safePage,
                pageSize: safePageSize,
                totalPages: Math.ceil(totalItems / safePageSize) || 1,
            },
        };
    }

    override async findById(id: string): Promise<Issue | null> {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }
        const document = await IssueModel.findById(id)
            .populate("category")
            .populate("createdBy", "fullName");
        if (!document) {
            return null;
        }
        return IssueMapper.toEntity(document);
    }

    async findFeedIssues(
        page: number,
        pageSize: number,
        filters?: IssueFilters,
        requestingUserId?: string
    ): Promise<PaginatedResult<Issue>> {
        const safePage = Number.isInteger(page) && page > 0 ? page : 1;
        const safePageSize = Number.isInteger(pageSize) && pageSize > 0 ? Math.min(pageSize, 100) : 10;

        const validRequestingUserId =
            requestingUserId && Types.ObjectId.isValid(requestingUserId)
                ? new Types.ObjectId(requestingUserId)
                : null;

        // Base Access Conditions according to JanFix business rules:
        // 1. PUBLIC issues are visible across non-rejected statuses (rejected issues are excluded from general feed)
        // 2. Pre-approval PRIVATE issues (non-verified, non-rejected) are visible in general listings
        // 3. Approved PRIVATE issues (status === VERIFIED) are visible ONLY to original reporter
        //    (and explicitly added members once membership support is introduced)
        // 4. Rejected issues (PUBLIC or PRIVATE) must NOT appear in general user-facing issue listings
        const baseAccessConditions: Record<string, unknown>[] = [
            {
                visibility: IssueVisibility.PUBLIC,
                status: { $ne: IssueStatus.REJECTED },
            },
            {
                visibility: IssueVisibility.PRIVATE,
                status: { $nin: [IssueStatus.VERIFIED, IssueStatus.REJECTED] },
            },
        ];

        if (validRequestingUserId) {
            baseAccessConditions.push({
                visibility: IssueVisibility.PRIVATE,
                status: IssueStatus.VERIFIED,
                createdBy: validRequestingUserId,
            });
        }

        const andConditions: Record<string, unknown>[] = [{ $or: baseAccessConditions }];

        const requestedVisibility = filters?.visibility?.toString().toUpperCase();
        const requestedStatus = filters?.status?.toString().toUpperCase();

        // 1. Visibility Filter
        if (requestedVisibility && requestedVisibility !== "ALL") {
            andConditions.push({ visibility: requestedVisibility as IssueVisibility });
        }

        // 2. Status Filter
        if (requestedStatus && requestedStatus !== "ALL") {
            andConditions.push({ status: requestedStatus as IssueStatus });
        }

        // 3. Category Filter
        if (filters?.category && filters.category !== "ALL") {
            if (Types.ObjectId.isValid(filters.category)) {
                andConditions.push({ category: new Types.ObjectId(filters.category) });
            }
        }

        // 4. Search Filter
        if (filters?.search && filters.search.trim().length > 0) {
            const escaped = filters.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            andConditions.push({
                $or: [
                    { title: { $regex: escaped, $options: "i" } },
                    { description: { $regex: escaped, $options: "i" } },
                ],
            });
        }

        const query: IssueFilter = andConditions.length > 0 ? { $and: andConditions } : {};
        const skip = (safePage - 1) * safePageSize;

        const [items, totalItems] = await Promise.all([
            IssueModel.find(query).populate("category").sort({ createdAt: -1, _id: -1 }).skip(skip).limit(safePageSize),
            IssueModel.countDocuments(query),
        ]);

        return {
            items: items.map(IssueMapper.toEntity),
            pagination: {
                totalItems,
                page: safePage,
                pageSize: safePageSize,
                totalPages: Math.ceil(totalItems / safePageSize) || 1,
            },
        };
    }

    async findAllPaginated(
        page: number,
        pageSize: number,
        filters?: IssueFilters
    ): Promise<PaginatedResult<Issue>> {
        const safePage = Number.isInteger(page) && page > 0 ? page : 1;
        const safePageSize = Number.isInteger(pageSize) && pageSize > 0 ? Math.min(pageSize, 100) : 10;

        const query: IssueFilter = {};

        if (filters?.status) {
            query.status = filters.status as IssueStatus;
        }

        if (filters?.visibility) {
            query.visibility = filters.visibility as IssueVisibility;
        }

        if (filters?.category) {
            query.category = new Types.ObjectId(filters.category);
        }

        if (filters?.search) {
            const escaped = filters.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            query.$or = [
                { title: { $regex: escaped, $options: "i" } },
                { description: { $regex: escaped, $options: "i" } },
            ];
        }

        const skip = (safePage - 1) * safePageSize;

        const [items, totalItems] = await Promise.all([
            IssueModel.find(query).populate("category").sort({ createdAt: -1, _id: -1 }).skip(skip).limit(safePageSize),
            IssueModel.countDocuments(query),
        ]);

        return {
            items: items.map(IssueMapper.toEntity),
            pagination: {
                totalItems,
                page: safePage,
                pageSize: safePageSize,
                totalPages: Math.ceil(totalItems / safePageSize) || 1,
            },
        };
    }

    async findReviewEligibleIssues(
        page: number,
        pageSize: number,
        filters?: AdminIssueFilters,
        serverNow: Date = new Date()
    ): Promise<PaginatedResult<ReviewEligibleIssueItem>> {
        const safePage = Number.isInteger(page) && page > 0 ? page : 1;
        const safePageSize = Number.isInteger(pageSize) && pageSize > 0 ? Math.min(pageSize, 100) : 10;

        const threshold = getReviewEligibilityThreshold(serverNow);

        const andConditions: Record<string, unknown>[] = [];

        // Status condition:
        // - When status filter is specified and not "ALL":
        //     - VERIFIED: return all verified issues
        //     - REJECTED: return all rejected issues
        //     - REPORTED: return reported issues that have completed their interaction window
        // - When status filter is omitted or "ALL":
        //     - default review queue returns issues pending admin review (REPORTED, createdAt <= threshold)
        if (filters?.status && filters.status !== "ALL") {
            const requestedStatus = filters.status.toString().toUpperCase();
            if (requestedStatus === IssueStatus.VERIFIED) {
                andConditions.push({ status: IssueStatus.VERIFIED });
            } else if (requestedStatus === IssueStatus.REJECTED) {
                andConditions.push({ status: IssueStatus.REJECTED });
            } else if (requestedStatus === IssueStatus.REPORTED) {
                andConditions.push({
                    status: IssueStatus.REPORTED,
                    createdAt: { $lte: threshold },
                });
            } else {
                andConditions.push({ status: { $in: [] } });
            }
        } else {
            andConditions.push({
                status: IssueStatus.REPORTED,
                createdAt: { $lte: threshold },
            });
        }

        // Visibility filter: ALL (no restriction), PUBLIC, or PRIVATE
        if (filters?.visibility && filters.visibility !== "ALL") {
            const requestedVisibility = filters.visibility.toString().toUpperCase();
            if (
                requestedVisibility === IssueVisibility.PUBLIC ||
                requestedVisibility === IssueVisibility.PRIVATE
            ) {
                andConditions.push({ visibility: requestedVisibility as IssueVisibility });
            } else {
                andConditions.push({ visibility: { $in: [] } });
            }
        }

        // Category filter
        if (filters?.category && filters.category !== "ALL") {
            if (Types.ObjectId.isValid(filters.category)) {
                andConditions.push({ category: new Types.ObjectId(filters.category) });
            }
        }

        // Search filter (title & description)
        if (filters?.search && filters.search.trim().length > 0) {
            const escaped = filters.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            andConditions.push({
                $or: [
                    { title: { $regex: escaped, $options: "i" } },
                    { description: { $regex: escaped, $options: "i" } },
                ],
            });
        }

        const query: IssueFilter = { $and: andConditions };
        const skip = (safePage - 1) * safePageSize;

        // Query issues sorted oldest eligible first ({ createdAt: 1, _id: 1 })
        const [docs, totalItems] = await Promise.all([
            IssueModel.find(query)
                .populate("category", "name")
                .populate("createdBy", "fullName email")
                .sort({ createdAt: 1, _id: 1 })
                .skip(skip)
                .limit(safePageSize),
            IssueModel.countDocuments(query),
        ]);

        const issueIds = docs.map((doc) => doc._id);

        // Efficient batch counts for upvotes and comments avoiding N+1 and avoiding loading docs into memory
        const [voteCounts, commentCounts] = await Promise.all([
            issueIds.length > 0
                ? IssueVoteModel.aggregate([
                    { $match: { issueId: { $in: issueIds } } },
                    { $group: { _id: "$issueId", count: { $sum: 1 } } },
                ])
                : Promise.resolve([]),
            issueIds.length > 0
                ? IssueCommentModel.aggregate([
                    { $match: { issueId: { $in: issueIds } } },
                    { $group: { _id: "$issueId", count: { $sum: 1 } } },
                ])
                : Promise.resolve([]),
        ]);

        const voteCountMap = new Map<string, number>(
            voteCounts.map((v: { _id: Types.ObjectId; count: number }) => [v._id.toString(), v.count])
        );
        const commentCountMap = new Map<string, number>(
            commentCounts.map((c: { _id: Types.ObjectId; count: number }) => [c._id.toString(), c.count])
        );

        const items: ReviewEligibleIssueItem[] = docs.map((doc) => {
            const id = doc._id.toString();
            const populatedCategory = doc.category as unknown as { _id?: Types.ObjectId; name?: string } | undefined;
            const populatedUser = doc.createdBy as unknown as { _id?: Types.ObjectId; fullName?: string; email?: string } | undefined;

            return {
                issue: IssueMapper.toEntity(doc),
                reporter: {
                    id: populatedUser?._id ? populatedUser._id.toString() : doc.createdBy?.toString() || "",
                    fullName: populatedUser?.fullName || "Anonymous Reporter",
                    email: populatedUser?.email,
                },
                category: {
                    id: populatedCategory?._id ? populatedCategory._id.toString() : doc.category?.toString() || "",
                    name: populatedCategory?.name || "Unknown Category",
                },
                upvoteCount: voteCountMap.get(id) || 0,
                commentCount: commentCountMap.get(id) || 0,
            };
        });

        return {
            items,
            pagination: {
                totalItems,
                page: safePage,
                pageSize: safePageSize,
                totalPages: Math.max(1, Math.ceil(totalItems / safePageSize)),
            },
        };
    }

    async updateStatusIfEligible(
        id: string,
        newStatus: IssueStatus,
        allowedCurrentStatuses: IssueStatus[],
        rejectionReason?: string,
        serverNow: Date = new Date()
    ): Promise<Issue | null> {
        if (!Types.ObjectId.isValid(id)) return null;

        const updateDoc: Record<string, unknown> = {
            status: newStatus,
        };

        if (newStatus === IssueStatus.REJECTED && rejectionReason !== undefined) {
            updateDoc.rejectionReason = rejectionReason;
        } else if (newStatus === IssueStatus.VERIFIED) {
            updateDoc.$unset = { rejectionReason: 1 };
        }

        const updated = await IssueModel.findOneAndUpdate(
            {
                _id: new Types.ObjectId(id),
                status: { $in: allowedCurrentStatuses },
                createdAt: { $lte: getReviewEligibilityThreshold(serverNow) },
            },
            updateDoc,
            { returnDocument: "after" }
        ).populate("category");

        return updated ? IssueMapper.toEntity(updated) : null;
    }
}
