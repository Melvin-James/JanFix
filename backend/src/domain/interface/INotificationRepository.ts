import type { Notification } from "../entities/Notification.ts";
import type { PaginatedResult } from "../../shared/types/Pagination.ts";

export interface INotificationRepository {
    create(data: Omit<Notification, "id" | "createdAt" | "updatedAt">): Promise<Notification>;
    createMany(data: Omit<Notification, "id" | "createdAt" | "updatedAt">[]): Promise<Notification[]>;
    findByRecipientPaginated(
        recipientId: string,
        page: number,
        pageSize: number
    ): Promise<PaginatedResult<Notification>>;
    countUnread(recipientId: string): Promise<number>;
    markAsRead(id: string, recipientId: string): Promise<Notification | null>;
    markAllAsRead(recipientId: string): Promise<number>;
}

