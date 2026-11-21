export type NotificationType =
  | "PROPOSAL_SELECTED"
  | "PROPOSAL_NOT_SELECTED"
  | "REPORTER_PROPOSAL_SELECTED"
  | "SYSTEM";

export interface NotificationItem {
  id: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  issueId?: string;
  proposalId?: string;
  metadata?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface GetNotificationsResponse {
  success: boolean;
  message?: string;
  data: {
    notifications: NotificationItem[];
    unreadCount: number;
    pagination: {
      totalItems: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
  };
}

export interface MarkAsReadResponse {
  success: boolean;
  message?: string;
  data: {
    id: string;
    isRead: boolean;
    readAt?: string;
  };
}

export interface MarkAllAsReadResponse {
  success: boolean;
  message?: string;
  data: {
    updatedCount: number;
  };
}

