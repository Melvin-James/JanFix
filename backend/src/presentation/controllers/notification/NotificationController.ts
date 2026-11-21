import type { Response } from "express";
import type { AuthRequest } from "../../../shared/types/AuthRequest.js";
import asyncHandler from "../../../shared/utils/asyncHandler.js";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";
import ApiError from "../../../shared/utils/apiError.js";
import { sendSuccess } from "../../../shared/response/index.js";
import type { GetNotificationsUseCase } from "../../../application/use-cases/notification/GetNotificationsUseCase.js";
import type { MarkNotificationAsReadUseCase } from "../../../application/use-cases/notification/MarkNotificationAsReadUseCase.js";

export class NotificationController {
    constructor(
        private readonly getNotificationsUseCase: GetNotificationsUseCase,
        private readonly markNotificationAsReadUseCase: MarkNotificationAsReadUseCase
    ) {}

    getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new ApiError(HttpStatusCode.UNAUTHORIZED, "User not authenticated");
        }

        const page = parseInt(req.query.page as string, 10) || 1;
        const pageSize = parseInt(req.query.pageSize as string, 10) || 10;

        const result = await this.getNotificationsUseCase.execute(userId, page, pageSize);

        return sendSuccess(res, result, "Notifications retrieved successfully", HttpStatusCode.OK);
    });

    markAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new ApiError(HttpStatusCode.UNAUTHORIZED, "User not authenticated");
        }

        const rawId = req.params.id;
        const id = Array.isArray(rawId) ? rawId[0] : rawId;
        if (!id) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "Notification ID is required");
        }

        const result = await this.markNotificationAsReadUseCase.executeSingle(id, userId);

        return sendSuccess(res, result, "Notification marked as read", HttpStatusCode.OK);
    });

    markAllAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new ApiError(HttpStatusCode.UNAUTHORIZED, "User not authenticated");
        }

        const result = await this.markNotificationAsReadUseCase.executeAll(userId);

        return sendSuccess(res, result, "All notifications marked as read", HttpStatusCode.OK);
    });
}
