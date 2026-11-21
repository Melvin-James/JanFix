import { Router } from "express";
import { NotificationRepository } from "../../infrastructure/repositories/NotificationRepository.js";
import { GetNotificationsUseCase } from "../../application/use-cases/notification/GetNotificationsUseCase.js";
import { MarkNotificationAsReadUseCase } from "../../application/use-cases/notification/MarkNotificationAsReadUseCase.js";
import { NotificationController } from "../controllers/notification/NotificationController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { ApiEndpoints } from "../../shared/constants/apiEndpoints.js";

const router = Router();

const notificationRepository = new NotificationRepository();
const getNotificationsUseCase = new GetNotificationsUseCase(notificationRepository);
const markNotificationAsReadUseCase = new MarkNotificationAsReadUseCase(notificationRepository);

const controller = new NotificationController(
    getNotificationsUseCase,
    markNotificationAsReadUseCase
);

// All notification endpoints require authentication
router.use(authenticate);

router.get(ApiEndpoints.NOTIFICATIONS.ROOT, controller.getNotifications);
router.patch(ApiEndpoints.NOTIFICATIONS.READ_ALL, controller.markAllAsRead);
router.patch(ApiEndpoints.NOTIFICATIONS.READ_SINGLE, controller.markAsRead);

export default router;

