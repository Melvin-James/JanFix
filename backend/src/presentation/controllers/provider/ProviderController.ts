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
import type { IGetProviderIssueDetailsUseCase } from "../../../application/use-cases/usecase interfaces/provider/IGetProviderIssueDetailsUseCase.js";
import type { ISubmitProposalUseCase } from "../../../application/use-cases/usecase interfaces/provider/ISubmitProposalUseCase.js";
import type { IGetProviderProposalUseCase } from "../../../application/use-cases/usecase interfaces/provider/IGetProviderProposalUseCase.js";
import type { IUpdateProposalUseCase } from "../../../application/use-cases/usecase interfaces/provider/IUpdateProposalUseCase.js";
import type { IWithdrawProposalUseCase } from "../../../application/use-cases/usecase interfaces/provider/IWithdrawProposalUseCase.js";
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
    private _getProviderIssueDetailsUseCase?: IGetProviderIssueDetailsUseCase,
    private _submitProposalUseCase?: ISubmitProposalUseCase,
    private _getProviderProposalUseCase?: IGetProviderProposalUseCase,
    private _updateProposalUseCase?: IUpdateProposalUseCase,
    private _withdrawProposalUseCase?: IWithdrawProposalUseCase,
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
          user,
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
          user,
        },
      });
    },
  );

  getProfile = asyncHandler(
    async (
      req: AuthRequest,
      res: Response,
    ): Promise<void> => {
      const profile = await this._getProviderProfileUseCase.execute(
        req.user!.userId,
      );

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: {
          profile,
        },
      });
    },
  );

  getCategories = asyncHandler(
    async (
      _req: AuthRequest,
      res: Response,
    ): Promise<void> => {
      if (!this._getCategoriesUseCase) {
        throw new ApiError(
          HttpStatusCode.INTERNAL_SERVER_ERROR,
          AppMessages.ERROR.INTERNAL_SERVER_ERROR,
        );
      }

      const categories = await this._getCategoriesUseCase.execute();

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: {
          categories,
        },
      });
    },
  );

  activate = asyncHandler(
    async (req: AuthRequest, res: Response): Promise<void> => {
      const providerId = req.user!.userId;
      if (!this._activateProviderUseCase) {
        throw new ApiError(
          HttpStatusCode.INTERNAL_SERVER_ERROR,
          AppMessages.ERROR.INTERNAL_SERVER_ERROR,
        );
      }

      const user = await this._activateProviderUseCase.execute(
        providerId,
        req.body,
      );

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "Provider account activated successfully",
        data: {
          user,
        },
      });
    },
  );

  getIssues = asyncHandler(
    async (req: AuthRequest, res: Response): Promise<void> => {
      const providerId = req.user!.userId;
      if (!this._getProviderIssuesUseCase) {
        throw new ApiError(HttpStatusCode.INTERNAL_SERVER_ERROR, AppMessages.ERROR.INTERNAL_SERVER_ERROR);
      }

      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 10;
      const category = typeof req.query.category === "string" ? req.query.category : undefined;
      const search = typeof req.query.search === "string" ? req.query.search : undefined;
      const visibility = typeof req.query.visibility === "string" ? req.query.visibility : undefined;

      const result = await this._getProviderIssuesUseCase.execute(providerId, page, pageSize, {
        category,
        search,
        visibility,
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

  getIssueDetails = asyncHandler(
    async (req: AuthRequest, res: Response): Promise<void> => {
      const providerId = req.user!.userId;
      const issueId = req.params.issueId;
      if (!issueId || typeof issueId !== "string") {
        throw new ApiError(HttpStatusCode.BAD_REQUEST, "Issue ID is required");
      }
      if (!this._getProviderIssueDetailsUseCase) {
        throw new ApiError(HttpStatusCode.INTERNAL_SERVER_ERROR, "Get provider issue details usecase not initialized");
      }

      const issue = await this._getProviderIssueDetailsUseCase.execute(issueId, providerId);

      res.status(HttpStatusCode.OK).json({
        success: true,
        issue,
      });
    }
  );

  submitProposal = asyncHandler(
    async (req: AuthRequest, res: Response): Promise<void> => {
      const providerId = req.user!.userId;
      const issueId = req.params.issueId;
      if (!issueId || typeof issueId !== "string") {
        throw new ApiError(HttpStatusCode.BAD_REQUEST, "Issue ID is required");
      }
      if (!this._submitProposalUseCase) {
        throw new ApiError(HttpStatusCode.INTERNAL_SERVER_ERROR, "Submit proposal use case not initialized");
      }

      const proposal = await this._submitProposalUseCase.execute(issueId, providerId, req.body);

      res.status(HttpStatusCode.CREATED).json({
        success: true,
        message: "Proposal submitted successfully",
        proposal,
      });
    }
  );

  getMyProposal = asyncHandler(
    async (req: AuthRequest, res: Response): Promise<void> => {
      const providerId = req.user!.userId;
      const issueId = req.params.issueId;
      if (!issueId || typeof issueId !== "string") {
        throw new ApiError(HttpStatusCode.BAD_REQUEST, "Issue ID is required");
      }
      if (!this._getProviderProposalUseCase) {
        throw new ApiError(HttpStatusCode.INTERNAL_SERVER_ERROR, "Get proposal use case not initialized");
      }

      const proposal = await this._getProviderProposalUseCase.execute(issueId, providerId);

      res.status(HttpStatusCode.OK).json({
        success: true,
        proposal,
      });
    }
  );

  updateProposal = asyncHandler(
    async (req: AuthRequest, res: Response): Promise<void> => {
      const providerId = req.user!.userId;
      const issueId = req.params.issueId;
      if (!issueId || typeof issueId !== "string") {
        throw new ApiError(HttpStatusCode.BAD_REQUEST, "Issue ID is required");
      }
      if (!this._updateProposalUseCase) {
        throw new ApiError(HttpStatusCode.INTERNAL_SERVER_ERROR, "Update proposal use case not initialized");
      }

      const proposal = await this._updateProposalUseCase.execute(issueId, providerId, req.body);

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "Proposal updated successfully",
        proposal,
      });
    }
  );

  withdrawProposal = asyncHandler(
    async (req: AuthRequest, res: Response): Promise<void> => {
      const providerId = req.user!.userId;
      const issueId = req.params.issueId;
      if (!issueId || typeof issueId !== "string") {
        throw new ApiError(HttpStatusCode.BAD_REQUEST, "Issue ID is required");
      }
      if (!this._withdrawProposalUseCase) {
        throw new ApiError(HttpStatusCode.INTERNAL_SERVER_ERROR, "Withdraw proposal use case not initialized");
      }

      const result = await this._withdrawProposalUseCase.execute(issueId, providerId);

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: result.message,
      });
    }
  );
}
