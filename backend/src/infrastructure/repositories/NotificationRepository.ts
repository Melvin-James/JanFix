import { Types } from "mongoose";
import type { INotificationRepository } from "../../domain/interface/INotificationRepository.ts";
import type { Notification } from "../../domain/entities/Notification.ts";
import type { PaginatedResult } from "../../shared/types/Pagination.ts";
import { NotificationModel } from "../models/NotificationModel.ts";
import { NotificationMapper } from "../mappers/NotificationMapper.ts";

export class NotificationRepository implements INotificationRepository {
    async create(data: Omit<Notification, "id" | "createdAt" | "updatedAt">): Promise<Notification> {
        const doc = await NotificationModel.create({
            recipientId: new Types.ObjectId(data.recipientId),
            type: data.type,
            title: data.title,
            message: data.message,
            issueId: data.issueId ? new Types.ObjectId(data.issueId) : undefined,
            proposalId: data.proposalId ? new Types.ObjectId(data.proposalId) : undefined,
            metadata: data.metadata,
            isRead: data.isRead ?? false,
            readAt: data.readAt,
        });

        return NotificationMapper.toEntity(doc);
    }

    async createMany(
        data: Omit<Notification, "id" | "createdAt" | "updatedAt">[]
    ): Promise<Notification[]> {
        if (!data || data.length === 0) return [];

        const docs = await NotificationModel.insertMany(
            data.map((item) => ({
                recipientId: new Types.ObjectId(item.recipientId),
                type: item.type,
                title: item.title,
                message: item.message,
                issueId: item.issueId ? new Types.ObjectId(item.issueId) : undefined,
                proposalId: item.proposalId ? new Types.ObjectId(item.proposalId) : undefined,
                metadata: item.metadata,
                isRead: item.isRead ?? false,
                readAt: item.readAt,
            }))
        );

        return docs.map(NotificationMapper.toEntity);
    }

    async findByRecipientPaginated(
        recipientId: string,
        page: number,
        pageSize: number
    ): Promise<PaginatedResult<Notification>> {
        if (!Types.ObjectId.isValid(recipientId)) {
            return {
                items: [],
                pagination: { totalItems: 0, page: 1, pageSize, totalPages: 1 },
            };
        }

        const safePage = Number.isInteger(page) && page > 0 ? page : 1;
        const safePageSize = Number.isInteger(pageSize) && pageSize > 0 ? Math.min(pageSize, 50) : 10;
        const skip = (safePage - 1) * safePageSize;

        const query = { recipientId: new Types.ObjectId(recipientId) };

        const [items, totalItems] = await Promise.all([
            NotificationModel.find(query).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(safePageSize),
            NotificationModel.countDocuments(query),
        ]);

        return {
            items: items.map(NotificationMapper.toEntity),
            pagination: {
                totalItems,
                page: safePage,
                pageSize: safePageSize,
                totalPages: Math.ceil(totalItems / safePageSize) || 1,
            },
        };
    }

    async countUnread(recipientId: string): Promise<number> {
        if (!Types.ObjectId.isValid(recipientId)) return 0;
        return NotificationModel.countDocuments({
            recipientId: new Types.ObjectId(recipientId),
            isRead: false,
        });
    }

    async markAsRead(id: string, recipientId: string): Promise<Notification | null> {
        if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(recipientId)) return null;

        const updated = await NotificationModel.findOneAndUpdate(
            {
                _id: new Types.ObjectId(id),
                recipientId: new Types.ObjectId(recipientId),
            },
            {
                $set: {
                    isRead: true,
                    readAt: new Date(),
                },
            },
            { returnDocument: "after" }
        );

        return updated ? NotificationMapper.toEntity(updated) : null;
    }

    async markAllAsRead(recipientId: string): Promise<number> {
        if (!Types.ObjectId.isValid(recipientId)) return 0;

        const res = await NotificationModel.updateMany(
            {
                recipientId: new Types.ObjectId(recipientId),
                isRead: false,
            },
            {
                $set: {
                    isRead: true,
                    readAt: new Date(),
                },
            }
        );

        return res.modifiedCount;
    }
}

