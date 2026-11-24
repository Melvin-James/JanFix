import type { Response } from "express";
import type { AuthRequest } from "../../../shared/types/AuthRequest.ts";
import asyncHandler from "../../../shared/utils/asyncHandler.ts";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.ts";
import ApiError from "../../../shared/utils/apiError.ts";
import { sendSuccess } from "../../../shared/response/index.ts";
import { AppMessages } from "../../../shared/constants/messages.ts";
import type { GetNotificationsUseCase } from "../../../application/use-cases/notification/GetNotificationsUseCase.ts";
import type { MarkNotificationAsReadUseCase } from "../../../application/use-cases/notification/MarkNotificationAsReadUseCase.ts";

export class NotificationController {
    constructor(
        private readonly _getNotificationsUseCase: GetNotificationsUseCase,
        private readonly _markNotificationAsReadUseCase: MarkNotificationAsReadUseCase
    ) {}

    getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new ApiError(HttpStatusCode.UNAUTHORIZED, AppMessages.ERROR.UNAUTHORIZED);
        }

        const page = parseInt(req.query.page as string, 10) || 1;
        const pageSize = parseInt(req.query.pageSize as string, 10) || 10;

        const result = await this._getNotificationsUseCase.execute(userId, page, pageSize);

        return sendSuccess(res, result, "Notifications retrieved successfully", HttpStatusCode.OK);
    });

    markAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new ApiError(HttpStatusCode.UNAUTHORIZED, AppMessages.ERROR.UNAUTHORIZED);
        }

        const rawId = req.params.id;
        const id = Array.isArray(rawId) ? rawId[0] : rawId;
        if (!id) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "Notification ID is required");
        }

        const result = await this._markNotificationAsReadUseCase.executeSingle(id, userId);

        return sendSuccess(res, result, "Notification marked as read", HttpStatusCode.OK);
    });

    markAllAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new ApiError(HttpStatusCode.UNAUTHORIZED, AppMessages.ERROR.UNAUTHORIZED);
        }

        const result = await this._markNotificationAsReadUseCase.executeAll(userId);

        return sendSuccess(res, result, "All notifications marked as read", HttpStatusCode.OK);
    });
}
