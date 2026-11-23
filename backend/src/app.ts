import express from "express";

import authRoutes from "./presentation/routes/authRoutes.js";

import providerRoutes from "./presentation/routes/providerRoutes.js";

import uploadRoutes from "./presentation/routes/uploadRoutes.js";

import adminRoutes from "./presentation/routes/adminRoutes.js";

import issueRoutes from "./presentation/routes/issueRoutes.js";

import notificationRoutes from "./presentation/routes/notificationRoutes.js";

import donationRoutes, { donationController } from "./presentation/routes/donationRoutes.js";

import errorMiddleware from "./presentation/middlewares/errorMiddleware.js";

import { ApiEndpoints } from "./shared/constants/apiEndpoints.js";

import cookieParser from "cookie-parser";

import cors from "cors";

const app = express();

// Stripe Webhook: Must be mounted BEFORE express.json() to preserve raw Buffer body for signature verification
app.post(
  `${ApiEndpoints.DONATIONS.BASE}${ApiEndpoints.DONATIONS.WEBHOOK}`,
  express.raw({ type: "application/json" }),
  donationController.handleWebhook
);

app.use(express.json());

app.use(cookieParser());

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(ApiEndpoints.AUTH.BASE, authRoutes);

app.use(ApiEndpoints.PROVIDER.BASE, providerRoutes);

app.use(ApiEndpoints.UPLOAD.BASE, uploadRoutes);

app.use(ApiEndpoints.ADMIN.BASE, adminRoutes);

app.use(ApiEndpoints.ISSUES.BASE, issueRoutes);

app.use(ApiEndpoints.NOTIFICATIONS.BASE, notificationRoutes);

app.use(ApiEndpoints.DONATIONS.BASE, donationRoutes);

app.use(errorMiddleware);

export default app;