import type { Document } from "mongoose";
import type { Notification } from "../../domain/entities/Notification.js";
import type { NotificationDocument } from "../models/NotificationModel.js";

export class NotificationMapper {
    static toEntity(doc: Document): Notification {
        const document = doc as NotificationDocument;
        return {
            id: document._id.toString(),
            recipientId: document.recipientId.toString(),
            type: document.type,
            title: document.title,
            message: document.message,
            issueId: document.issueId ? document.issueId.toString() : undefined,
            proposalId: document.proposalId ? document.proposalId.toString() : undefined,
            metadata: document.metadata,
            isRead: document.isRead,
            readAt: document.readAt,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
        };
    }
}

