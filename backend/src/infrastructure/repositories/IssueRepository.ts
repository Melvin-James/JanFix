import { Types, type QueryFilter } from "mongoose";
import type { IIssueRepository, IssueFilters } from "../../domain/interface/IIssueRepository.js";
import type { Issue } from "../../domain/entities/Issue.js";
import { IssueModel, type IssueDocument } from "../models/IssueModel.js";
import { BaseRepository } from "./base/BaseRepository.js";
import { IssueMapper } from "../mappers/IssueMapper.js";
import type { PaginatedResult } from "../../shared/types/Pagination.js";
import type { IssueStatus } from "../../domain/enums/IssueStatus.js";
import type { IssueVisibility } from "../../domain/enums/IssueVisibility.js";

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
            IssueModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(safePageSize),
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
            IssueModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(safePageSize),
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
