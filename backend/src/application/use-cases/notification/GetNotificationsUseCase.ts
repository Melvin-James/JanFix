import type { INotificationRepository } from "../../../domain/interface/INotificationRepository.ts";
import type { GetNotificationsResultDTO } from "../../dto/notification/NotificationResponseDTO.ts";

export class GetNotificationsUseCase {
    constructor(private readonly _notificationRepository: INotificationRepository) {}

    async execute(
        userId: string,
        page: number = 1,
        pageSize: number = 10
    ): Promise<GetNotificationsResultDTO> {
        const [paginated, unreadCount] = await Promise.all([
            this._notificationRepository.findByRecipientPaginated(userId, page, pageSize),
            this._notificationRepository.countUnread(userId),
        ]);

        return {
            notifications: paginated.items.map((n) => ({
                id: n.id || "",
                recipientId: n.recipientId,
                type: n.type,
                title: n.title,
                message: n.message,
                issueId: n.issueId,
                proposalId: n.proposalId,
                metadata: n.metadata,
                isRead: n.isRead,
                readAt: n.readAt instanceof Date ? n.readAt.toISOString() : undefined,
                createdAt: n.createdAt instanceof Date ? n.createdAt.toISOString() : new Date().toISOString(),
            })),
            unreadCount,
            pagination: paginated.pagination,
        };
    }
}

