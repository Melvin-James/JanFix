import { Types, type QueryFilter } from "mongoose";
import type { IIssueRepository, IssueFilters } from "../../domain/interface/IIssueRepository.js";
import type { Issue } from "../../domain/entities/Issue.js";
import { IssueModel, type IssueDocument } from "../models/IssueModel.js";
import { BaseRepository } from "./base/BaseRepository.js";
import { IssueMapper } from "../mappers/IssueMapper.js";
import type { PaginatedResult } from "../../shared/types/Pagination.js";
import { IssueStatus } from "../../domain/enums/IssueStatus.js";
import { IssueVisibility } from "../../domain/enums/IssueVisibility.js";

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

    override async findById(id: string): Promise<Issue | null> {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }
        const document = await IssueModel.findById(id).populate("category");
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
        // 1. All PUBLIC issues are visible across all statuses (REPORTED, UNDER_REVIEW, VERIFIED, REJECTED)
        // 2. Pre-approval PRIVATE issues (status !== VERIFIED) are visible in general listings
        // 3. Approved PRIVATE issues (status === VERIFIED) are visible ONLY to original reporter
        //    (and explicitly added members once membership support is introduced)
        const baseAccessConditions: Record<string, unknown>[] = [
            { visibility: IssueVisibility.PUBLIC },
            {
                visibility: IssueVisibility.PRIVATE,
                status: { $ne: IssueStatus.VERIFIED },
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
}
