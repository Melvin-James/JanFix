import { Schema, model, type Document, Types } from "mongoose";
import { NotificationType } from "../../domain/enums/NotificationType.ts";

export interface NotificationDocument extends Document {
    recipientId: Types.ObjectId;
    type: NotificationType;
    title: string;
    message: string;
    issueId?: Types.ObjectId | undefined;
    proposalId?: Types.ObjectId | undefined;
    metadata?: Record<string, unknown> | undefined;
    isRead: boolean;
    readAt?: Date | undefined;
    createdAt: Date;
    updatedAt: Date;
}

const notificationSchema = new Schema<NotificationDocument>(
    {
        recipientId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: Object.values(NotificationType),
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },
        issueId: {
            type: Schema.Types.ObjectId,
            ref: "Issue",
            index: true,
        },
        proposalId: {
            type: Schema.Types.ObjectId,
            ref: "Proposal",
            index: true,
        },
        metadata: {
            type: Schema.Types.Mixed,
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true,
        },
        readAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for query performance
notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

export const NotificationModel = model<NotificationDocument>("Notification", notificationSchema);

