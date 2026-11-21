import type { INotificationRepository } from "../../../domain/interface/INotificationRepository.js";
import ApiError from "../../../shared/utils/apiError.js";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

export class MarkNotificationAsReadUseCase {
    constructor(private readonly notificationRepository: INotificationRepository) {}

    async executeSingle(id: string, userId: string) {
        const updated = await this.notificationRepository.markAsRead(id, userId);
        if (!updated) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, "Notification not found");
        }
        return {
            id: updated.id,
            isRead: updated.isRead,
            readAt: updated.readAt?.toISOString(),
        };
    }

    async executeAll(userId: string) {
        const count = await this.notificationRepository.markAllAsRead(userId);
        return { updatedCount: count };
    }
}

