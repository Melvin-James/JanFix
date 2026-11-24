import type { INotificationRepository } from "../../../domain/interface/INotificationRepository.ts";
import ApiError from "../../../shared/utils/apiError.ts";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.ts";

export class MarkNotificationAsReadUseCase {
    constructor(private readonly _notificationRepository: INotificationRepository) {}

    async executeSingle(id: string, userId: string) {
        const updated = await this._notificationRepository.markAsRead(id, userId);
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
        const count = await this._notificationRepository.markAllAsRead(userId);
        return { updatedCount: count };
    }
}

