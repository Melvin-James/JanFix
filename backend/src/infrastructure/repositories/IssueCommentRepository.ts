import { Types } from "mongoose";
import type { IIssueCommentRepository } from "../../domain/interface/IIssueCommentRepository.js";
import type { IssueComment } from "../../domain/entities/IssueComment.js";
import type { IssueCommentResponseDTO } from "../../application/dto/issue/IssueCommentResponseDTO.js";
import type { PaginatedResult } from "../../shared/types/Pagination.js";
import { IssueCommentModel } from "../models/IssueCommentModel.js";
import { IssueCommentMapper } from "../mappers/IssueCommentMapper.js";
import { BaseRepository } from "./base/BaseRepository.js";

export class IssueCommentRepository extends BaseRepository<IssueComment> implements IIssueCommentRepository {
    constructor() {
        super(IssueCommentModel, IssueCommentMapper.toEntity);
    }

    async createComment(issueId: string, userId: string, body: string): Promise<IssueCommentResponseDTO> {
        const doc = await IssueCommentModel.create({
            issueId: new Types.ObjectId(issueId),
            userId: new Types.ObjectId(userId),
            body: body.trim(),
        });

        await doc.populate("userId", "fullName");

        const authorUser = doc.userId as unknown as { _id?: Types.ObjectId; fullName?: string };

        return {
            id: doc._id.toString(),
            issueId: doc.issueId.toString(),
            body: doc.body,
            author: {
                id: authorUser?._id ? authorUser._id.toString() : userId,
                fullName: authorUser?.fullName || "Anonymous User",
            },
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        };
    }

    async findCommentsByIssueId(
        issueId: string,
        page: number,
        pageSize: number
    ): Promise<PaginatedResult<IssueCommentResponseDTO>> {
        const safePage = Number.isInteger(page) && page > 0 ? page : 1;
        const safePageSize = Number.isInteger(pageSize) && pageSize > 0 ? Math.min(pageSize, 100) : 20;
        const skip = (safePage - 1) * safePageSize;

        const filter = { issueId: new Types.ObjectId(issueId) };

        const [items, totalItems] = await Promise.all([
            IssueCommentModel.find(filter)
                .sort({ createdAt: 1, _id: 1 })
                .skip(skip)
                .limit(safePageSize)
                .populate("userId", "fullName"),
            IssueCommentModel.countDocuments(filter),
        ]);

        return {
            items: items.map((doc) => {
                const authorUser = doc.userId as unknown as { _id?: Types.ObjectId; fullName?: string };
                return {
                    id: doc._id.toString(),
                    issueId: doc.issueId.toString(),
                    body: doc.body,
                    author: {
                        id: authorUser?._id ? authorUser._id.toString() : String(doc.userId),
                        fullName: authorUser?.fullName || "Anonymous User",
                    },
                    createdAt: doc.createdAt,
                    updatedAt: doc.updatedAt,
                };
            }),
            pagination: {
                page: safePage,
                pageSize: safePageSize,
                totalItems,
                totalPages: Math.ceil(totalItems / safePageSize) || 1,
            },
        };
    }
}
export default IssueCommentRepository;
