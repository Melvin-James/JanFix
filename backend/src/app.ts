import express from "express";

import authRoutes from "./presentation/routes/authRoutes.ts";

import providerRoutes from "./presentation/routes/providerRoutes.ts";

import uploadRoutes from "./presentation/routes/uploadRoutes.ts";

import adminRoutes from "./presentation/routes/adminRoutes.ts";

import issueRoutes from "./presentation/routes/issueRoutes.ts";

import notificationRoutes from "./presentation/routes/notificationRoutes.ts";

import donationRoutes, { donationController } from "./presentation/routes/donationRoutes.ts";

import errorMiddleware from "./presentation/middlewares/errorMiddleware.ts";

import { ApiEndpoints } from "./shared/constants/apiEndpoints.ts";

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