import type { Request, Response } from "express";
import type { AuthRequest } from "../../../shared/types/AuthRequest.ts";
import asyncHandler from "../../../shared/utils/asyncHandler.ts";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.ts";
import { sendSuccess, sendError } from "../../../shared/response/index.ts";
import { AppMessages } from "../../../shared/constants/messages.ts";
import type { CreateDonationIntentInput } from "../../../application/dto/donation/CreateDonationIntentDTO.ts";
import type { CreateDonationPaymentIntentUseCase } from "../../../application/use-cases/donation/CreateDonationPaymentIntentUseCase.ts";
import type { HandleStripeWebhookUseCase } from "../../../application/use-cases/donation/HandleStripeWebhookUseCase.ts";
import type { GetIssueDonationsUseCase } from "../../../application/use-cases/donation/GetIssueDonationsUseCase.ts";
import type { GetDonationStatusUseCase } from "../../../application/use-cases/donation/GetDonationStatusUseCase.ts";
import type { RetryDonationPaymentUseCase } from "../../../application/use-cases/donation/RetryDonationPaymentUseCase.ts";
import logger from "../../../shared/utils/logger.ts";

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
        sendError(res, AppMessages.ERROR.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
        return;
      }

      const body = req.body as CreateDonationIntentInput;
      const result = await this._createPaymentIntentUseCase.execute(
        userId,
        body
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
        sendError(res, AppMessages.ERROR.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
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
        sendError(res, AppMessages.ERROR.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
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
