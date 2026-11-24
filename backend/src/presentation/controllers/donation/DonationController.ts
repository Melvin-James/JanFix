import type { Request, Response } from "express";
import type { AuthRequest } from "../../../shared/types/AuthRequest.js";
import asyncHandler from "../../../shared/utils/asyncHandler.js";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";
import { sendSuccess, sendError } from "../../../shared/response/index.js";
import { createDonationIntentSchema } from "../../../application/dto/donation/CreateDonationIntentDTO.js";
import type { CreateDonationPaymentIntentUseCase } from "../../../application/use-cases/donation/CreateDonationPaymentIntentUseCase.js";
import type { HandleStripeWebhookUseCase } from "../../../application/use-cases/donation/HandleStripeWebhookUseCase.js";
import type { GetIssueDonationsUseCase } from "../../../application/use-cases/donation/GetIssueDonationsUseCase.js";
import type { GetDonationStatusUseCase } from "../../../application/use-cases/donation/GetDonationStatusUseCase.js";
import type { RetryDonationPaymentUseCase } from "../../../application/use-cases/donation/RetryDonationPaymentUseCase.js";
import logger from "../../../shared/utils/logger.js";

export class DonationController {
  constructor(
    private readonly _createPaymentIntentUseCase: CreateDonationPaymentIntentUseCase,
    private readonly _handleWebhookUseCase: HandleStripeWebhookUseCase,
    private readonly _getIssueDonationsUseCase: GetIssueDonationsUseCase,
    private readonly _getDonationStatusUseCase: GetDonationStatusUseCase,
    private readonly _retryDonationPaymentUseCase: RetryDonationPaymentUseCase
  ) {}

  createPaymentIntent = asyncHandler(
    async (req: AuthRequest, res: Response): Promise<void> => {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, "Unauthorized", HttpStatusCode.UNAUTHORIZED);
        return;
      }

      const parsed = createDonationIntentSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const result = await this._createPaymentIntentUseCase.execute(
        userId,
        parsed.data
      );

      sendSuccess(
        res,
        result,
        "Donation payment intent initialized successfully",
        HttpStatusCode.CREATED
      );
    }
  );

  handleWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
      const signature = req.headers["stripe-signature"] as string | undefined;
      const rawBody = req.body as Buffer;

      const result = await this._handleWebhookUseCase.execute(rawBody, signature);
      res.status(HttpStatusCode.OK).json(result);
    } catch (error: unknown) {
      const err = error as { message?: string };
      logger.error(`Stripe webhook processing error: ${err?.message}`);
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send(`Webhook Error: ${err?.message || "Unknown error"}`);
    }
  };

  getIssueDonations = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const issueId = req.params.issueId as string;
      const page = parseInt((req.query.page as string) || "1", 10);
      const pageSize = parseInt(
        (req.query.pageSize as string) || (req.query.limit as string) || "10",
        10
      );

      const result = await this._getIssueDonationsUseCase.execute(
        issueId,
        page,
        pageSize
      );

      sendSuccess(
        res,
        result,
        "Issue donations retrieved successfully",
        HttpStatusCode.OK,
        {
          donations: result.donations,
          totalDonors: result.totalDonors,
          totalAmountRaisedPaise: result.totalAmountRaisedPaise,
        }
      );
    }
  );

  getDonationStatus = asyncHandler(
    async (req: AuthRequest, res: Response): Promise<void> => {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, "Unauthorized", HttpStatusCode.UNAUTHORIZED);
        return;
      }

      const donationId = req.params.id as string;
      const result = await this._getDonationStatusUseCase.execute(
        donationId,
        userId
      );

      sendSuccess(
        res,
        result,
        "Donation status retrieved successfully",
        HttpStatusCode.OK
      );
    }
  );

  retryPayment = asyncHandler(
    async (req: AuthRequest, res: Response): Promise<void> => {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, "Unauthorized", HttpStatusCode.UNAUTHORIZED);
        return;
      }

      const donationId = req.params.id as string;
      const result = await this._retryDonationPaymentUseCase.execute(
        donationId,
        userId
      );

      sendSuccess(
        res,
        result,
        "Payment retry evaluated successfully",
        HttpStatusCode.OK
      );
    }
  );
}
