import type { NotificationType } from "../../../domain/enums/NotificationType.ts";

export interface NotificationResponseDTO {
    id: string;
    recipientId: string;
    type: NotificationType;
    title: string;
    message: string;
    issueId?: string | undefined;
    proposalId?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    isRead: boolean;
    readAt?: string | undefined;
    createdAt: string;
}

export interface GetNotificationsResultDTO {
    notifications: NotificationResponseDTO[];
    unreadCount: number;
    pagination: {
        totalItems: number;
        page: number;
        pageSize: number;
        totalPages: number;
    };
}

