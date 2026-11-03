import type { Response } from "express";

import type { AuthRequest } from "../../../shared/types/AuthRequest.js";

import asyncHandler from "../../../shared/utils/asyncHandler.js";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

import type { ISubmitProviderApplicationUseCase } from "../../../application/use-cases/usecase interfaces/provider/ISubmitProviderApplicationUseCase.js";

import type { IResubmitProviderApplicationUseCase } from "../../../application/use-cases/usecase interfaces/provider/IResubmitProviderApplicationUseCase.js";

import type { IGetProviderProfileUseCase } from "../../../application/use-cases/usecase interfaces/provider/IGetProviderProfileUseCase.js";

import type { IGetCategoriesUseCase } from "../../../application/use-cases/usecase interfaces/category/IGetCategoriesUseCase.js";

import type { IActivateProviderUseCase } from "../../../application/use-cases/usecase interfaces/provider/IActivateProviderUseCase.js";

import type { IGetProviderIssuesUseCase } from "../../../application/use-cases/usecase interfaces/provider/IGetProviderIssuesUseCase.js";

import type { IExpressIssueInterestUseCase } from "../../../application/use-cases/usecase interfaces/provider/IExpressIssueInterestUseCase.js";

import ApiError from "../../../shared/utils/apiError.js";

import { AppMessages } from "../../../shared/constants/messages.js";

import { UserMapper } from "../../../application/mappers/LoginMapper.js";

export class ProviderController {
  constructor(
    private _submitProviderApplicationUseCase: ISubmitProviderApplicationUseCase,
    private _resubmitProviderApplicationUseCase: IResubmitProviderApplicationUseCase,
    private _getProviderProfileUseCase: IGetProviderProfileUseCase,
    private _getCategoriesUseCase?: IGetCategoriesUseCase,
    private _activateProviderUseCase?: IActivateProviderUseCase,
    private _getProviderIssuesUseCase?: IGetProviderIssuesUseCase,
    private _expressIssueInterestUseCase?: IExpressIssueInterestUseCase,
  ) {}

  submit = asyncHandler(
    async (
      req: AuthRequest,

      res: Response,
    ): Promise<void> => {
      const user = await this._submitProviderApplicationUseCase.execute(
        req.user!.userId,

        req.body,
      );

      res.status(HttpStatusCode.CREATED).json({
        success: true,

        message: AppMessages.SUCCESS.SERVICE_PROVIDER_PROFILE_CREATED,

        data: {
          user: UserMapper.toAuthResponse(user),
        },
      });
    },
  );

  resubmit = asyncHandler(
    async (
      req: AuthRequest,

      res: Response,
    ): Promise<void> => {
      const user = await this._resubmitProviderApplicationUseCase.execute(
        req.user!.userId,

        req.body,
      );

      res.status(HttpStatusCode.OK).json({
        success: true,

        message: AppMessages.SUCCESS.APPLICATION_RESUBMITTED,

        data: {
          user: UserMapper.toAuthResponse(user),
        },
      });
    },
  );

  getProfile = asyncHandler(
    async (
      req: AuthRequest,

      res: Response,
    ): Promise<void> => {
      const provider = await this._getProviderProfileUseCase.execute(
        req.user!.userId,
        req.user!.userId,
      );

      res.status(HttpStatusCode.OK).json({
        success: true,

        provider,
      });
    },
  );

  getCategories = asyncHandler(
    async (_req: AuthRequest, res: Response): Promise<void> => {
      if (!this._getCategoriesUseCase) {
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: "Category use case not configured",
        });
        return;
      }

      const result = await this._getCategoriesUseCase.execute();
      const activeCategories = Array.isArray(result)
        ? result.filter((cat) => cat.isActive)
        : result.items.filter((cat) => cat.isActive);

      res.status(HttpStatusCode.OK).json({
        success: true,
        categories: activeCategories,
      });
    },
  );

  activate = asyncHandler(
    async (req: AuthRequest, res: Response): Promise<void> => {
      const userId = req.user!.userId;
      if (!this._activateProviderUseCase) {
        throw new ApiError(HttpStatusCode.INTERNAL_SERVER_ERROR, "Activate provider usecase not initialized");
      }
      const updatedUser = await this._activateProviderUseCase.execute(userId);
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "Service provider account successfully activated.",
        data: {
          user: updatedUser,
        },
      });
    }
  );

  getIssues = asyncHandler(
    async (req: AuthRequest, res: Response): Promise<void> => {
      const providerId = req.user!.userId;
      if (!this._getProviderIssuesUseCase) {
        throw new ApiError(HttpStatusCode.INTERNAL_SERVER_ERROR, "Get provider issues usecase not initialized");
      }

      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 10;
      const category = typeof req.query.category === "string" ? req.query.category : undefined;
      const search = typeof req.query.search === "string" ? req.query.search : undefined;

      const result = await this._getProviderIssuesUseCase.execute(providerId, page, pageSize, {
        category,
        search,
      });

      res.status(HttpStatusCode.OK).json({
        success: true,
        issues: result.items,
        pagination: result.pagination,
      });
    }
  );

  expressInterest = asyncHandler(
    async (req: AuthRequest, res: Response): Promise<void> => {
      const providerId = req.user!.userId;
      const issueId = req.params.issueId;
      if (!issueId || typeof issueId !== "string") {
        throw new ApiError(HttpStatusCode.BAD_REQUEST, "Issue ID is required");
      }
      if (!this._expressIssueInterestUseCase) {
        throw new ApiError(HttpStatusCode.INTERNAL_SERVER_ERROR, "Express interest usecase not initialized");
      }

      const result = await this._expressIssueInterestUseCase.execute(issueId, providerId);

      res.status(HttpStatusCode.CREATED).json({
        success: true,
        message: result.message,
      });
    }
  );
}
