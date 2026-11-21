import type { NotificationType } from "../enums/NotificationType.js";

export interface Notification {
    id?: string;
    recipientId: string;
    type: NotificationType;
    title: string;
    message: string;
    issueId?: string | undefined;
    proposalId?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    isRead: boolean;
    readAt?: Date | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
}

