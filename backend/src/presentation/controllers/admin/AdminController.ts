import type { Request, Response } from "express";

import type { AuthRequest } from "../../../shared/types/AuthRequest.js";

import asyncHandler from "../../../shared/utils/asyncHandler.js";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

import type { IGetProviderApplicationsUseCase } from "../../../application/use-cases/usecase interfaces/admin/IGetProviderApplicationsUseCase.js";

import type { IGetProviderApplicationDetailsUseCase } from "../../../application/use-cases/usecase interfaces/provider/IGetProviderApplicationDetailsUseCase.js";

import type { IApproveProviderApplicationUseCase } from "../../../application/use-cases/usecase interfaces/admin/IApproveProviderApplicationUseCase.js";

import type { IRejectProviderApplicationUseCase } from "../../../application/use-cases/usecase interfaces/admin/IRejectProviderApplicationUseCase.js";

import type { IGetServiceProvidersUseCase } from "../../../application/use-cases/usecase interfaces/admin/IGetServiceProvidersUseCase.js";

import type { IGetServiceProviderDetailsUseCase } from "../../../application/use-cases/usecase interfaces/admin/IGetServiceProviderDetailsUseCase.js";

import type { IUpdateServiceProviderStatusUseCase } from "../../../application/use-cases/usecase interfaces/admin/IUpdateServiceProviderStatusUseCase.js";

import type { IGetUsersForManagementUseCase } from "../../../application/use-cases/usecase interfaces/admin/IGetUsersForManagementUseCase.js";

import type { IUpdateUserAccountStatusUseCase } from "../../../application/use-cases/usecase interfaces/admin/IUpdateUserAccountStatusUseCase.js";

import type { ICreateCategoryUseCase } from "../../../application/use-cases/usecase interfaces/category/ICreateCategoryUseCase.js";

import type { IGetCategoriesUseCase } from "../../../application/use-cases/usecase interfaces/category/IGetCategoriesUseCase.js";

import type { IUpdateCategoryUseCase } from "../../../application/use-cases/usecase interfaces/category/IUpdateCategoryUseCase.js";

import type { IUpdateCategoryStatusUseCase } from "../../../application/use-cases/usecase interfaces/category/IUpdateCategoryStatusUseCase.js";
import type { IGetReviewEligibleIssuesUseCase } from "../../../application/use-cases/usecase interfaces/admin/IGetReviewEligibleIssuesUseCase.js";
import type { IApproveIssueUseCase } from "../../../application/use-cases/usecase interfaces/admin/IApproveIssueUseCase.js";
import type { IRejectIssueUseCase } from "../../../application/use-cases/usecase interfaces/admin/IRejectIssueUseCase.js";
import type { IGetIssueAIAnalysisUseCase } from "../../../application/use-cases/usecase interfaces/admin/IGetIssueAIAnalysisUseCase.js";
import type { IAnalyzeIssueCommentsUseCase } from "../../../application/use-cases/usecase interfaces/admin/IAnalyzeIssueCommentsUseCase.js";
import { Role } from "../../../domain/enums/Role.js";
import ApiError from "../../../shared/utils/apiError.js";

import { AppMessages } from "../../../shared/constants/messages.js";
import { sendSuccess, sendPaginated, sendError } from "../../../shared/response/index.js";

export class AdminController {

    constructor(

        private _getProviderApplicationUseCase: IGetProviderApplicationsUseCase,

        private _getProviderApplicationDetailUseCase: IGetProviderApplicationDetailsUseCase,

        private readonly _approveProviderApplicationUseCase: IApproveProviderApplicationUseCase,

        private readonly _rejectProviderApplicationUseCase: IRejectProviderApplicationUseCase,

        private readonly _getServiceProvidersUseCase: IGetServiceProvidersUseCase,

        private readonly _getServiceProviderDetailsUseCase: IGetServiceProviderDetailsUseCase,

        private readonly _updateServiceProviderStatusUseCase: IUpdateServiceProviderStatusUseCase,

        private readonly _getUsersForManagementUseCase: IGetUsersForManagementUseCase,

        private readonly _updateUserAccountStatusUseCase: IUpdateUserAccountStatusUseCase,

        private readonly _createCategoryUseCase: ICreateCategoryUseCase,

        private readonly _getCategoriesUseCase: IGetCategoriesUseCase,

        private readonly _updateCategoryUseCase: IUpdateCategoryUseCase,

        private readonly _updateCategoryStatusUseCase: IUpdateCategoryStatusUseCase,

        private readonly _getReviewEligibleIssuesUseCase: IGetReviewEligibleIssuesUseCase,

        private readonly _approveIssueUseCase: IApproveIssueUseCase,

        private readonly _rejectIssueUseCase: IRejectIssueUseCase,

        private readonly _getIssueAIAnalysisUseCase?: IGetIssueAIAnalysisUseCase,

        private readonly _analyzeIssueCommentsUseCase?: IAnalyzeIssueCommentsUseCase,

    ) { }

    getProviderApplications = asyncHandler(
        async (req: AuthRequest, res: Response): Promise<void> => {
            const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
            const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 10;
            const search = req.query.search as string | undefined;
            const status = req.query.status as string | undefined;
            const providerType = req.query.providerType as string | undefined;

            const result = await this._getProviderApplicationUseCase.execute(
                page,
                pageSize,
                { search, status, providerType }
            );

            sendPaginated(res, result.items, result.pagination, "applications", HttpStatusCode.OK);
        }
    );

    getProviderApplicationDetails = asyncHandler(
        async (req: AuthRequest, res: Response): Promise<void> => {

            const userId = req.params.userId as string;

            const application = await this._getProviderApplicationDetailUseCase.execute(userId);

            sendSuccess(res, application, undefined, HttpStatusCode.OK, { application });
        }
    );

    approveProviderApplication = asyncHandler(
        async (req: AuthRequest, res: Response): Promise<void> => {

            const userId = req.params.userId as string;

            await this._approveProviderApplicationUseCase.execute(userId);

            sendSuccess(res, undefined, AppMessages.SUCCESS.PROVIDER_APPLICATION_APPROVED, HttpStatusCode.OK);
        }
    )

    rejectProviderApplication = asyncHandler(
        async (req: AuthRequest, res: Response): Promise<void> => {


            const userId = req.params.userId as string;

            const { rejectionReason } = req.body;

            await this._rejectProviderApplicationUseCase.execute(
                userId,
                rejectionReason
            );

            sendSuccess(res, undefined, AppMessages.SUCCESS.PROVIDER_APPLICATION_REJECTED, HttpStatusCode.OK);
        }
    )

    getServiceProviders = asyncHandler(
        async (req: AuthRequest, res: Response): Promise<void> => {
            const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
            const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 10;
            const search = req.query.search as string | undefined;
            const providerType = req.query.providerType as string | undefined;
            const status = req.query.status as string | undefined;

            const result = await this._getServiceProvidersUseCase.execute(
                page,
                pageSize,
                { search, providerType, status }
            );

            sendPaginated(res, result.items, result.pagination, "providers", HttpStatusCode.OK);
        }
    );

    getServiceProviderDetails = asyncHandler(
        async (
            req: AuthRequest,
            res: Response
        ): Promise<void> => {

            const userId = req.params.userId as string;

            const provider = await this._getServiceProviderDetailsUseCase.execute(userId);

            sendSuccess(res, provider, undefined, HttpStatusCode.OK, { provider });
        }
    )

    updateServiceProviderStatus = asyncHandler(

        async (req: Request, res: Response) => {

            const userId = req.params.userId as string;


            const { status } = req.body

            const provider = await this._updateServiceProviderStatusUseCase.execute(

                userId,

                status

            );

            sendSuccess(res, provider, undefined, HttpStatusCode.OK, { provider });

        }
    )

    getUsersForManagement = asyncHandler(
        async (req: Request, res: Response) => {

            const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;

            const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 10;

            const search = req.query.search as string | undefined;

            const role = req.query.role as string | undefined;

            const verification = req.query.verification as string | undefined;
            
            const authProvider = req.query.authProvider as string | undefined;

            const result = await this._getUsersForManagementUseCase.execute(
                page,
                pageSize,
                { search, role, verification, authProvider }
            );

            sendPaginated(res, result.items, result.pagination, "users", HttpStatusCode.OK);
        }
    );

    updateUserAccountStatus = asyncHandler(
        async (req: Request, res: Response) => {
            const userId = req.params.userId as string;


            const { status } = req.body;

            const user = await this._updateUserAccountStatusUseCase.execute(
                userId,
                status
            );

            sendSuccess(res, user, undefined, HttpStatusCode.OK, { user });
        }
    );

    createCategory = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {

            const category = await this._createCategoryUseCase.execute(
                req.body
            );

            sendSuccess(res, category, undefined, HttpStatusCode.CREATED, { category });
        }
    )

    getCategories = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {

            const hasPaginationParams = 
                req.query.page !== undefined ||
                req.query.pageSize !== undefined;

            const search = req.query.search as string | undefined;

            const status = req.query.status as string | undefined;

            if(hasPaginationParams) {
                const parsedPage = Number.parseInt(
                    req.query.page as string,
                    10
                );

                const parsedPageSize = Number.parseInt(
                    req.query.pageSize as string,
                    10
                );

                const page = 
                    Number.isInteger(parsedPage) && parsedPage > 0
                    ? parsedPage
                    : 1;

                const pageSize = Number.isInteger(parsedPageSize) && parsedPageSize > 0
                    ? Math.min(parsedPageSize, 100)
                    : 10;

                const result = await this._getCategoriesUseCase.execute(
                    page,
                    pageSize,
                    { search, status }
                );

                if ("items" in result) {
                    sendPaginated(res, result.items, result.pagination, "categories", HttpStatusCode.OK);
                    return;
                }
            }

            const categories = await this._getCategoriesUseCase.execute();

            sendSuccess(res, categories, undefined, HttpStatusCode.OK, { categories });
        }
    );


    updateCategory = asyncHandler(
        async(req: Request, res: Response): Promise<void> => {

            const categoryId = req.params.categoryId as string;

            const category = await this._updateCategoryUseCase.execute(
                categoryId,
                req.body
            );

            sendSuccess(res, category, undefined, HttpStatusCode.OK, { category });

        }
    );

    updateCategoryStatus = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const categoryId = req.params.categoryId as string;

            let isActive: boolean;
            if (typeof req.body.isActive === "boolean") {
                isActive = req.body.isActive;
            } else if (req.body.status === "ACTIVE") {
                isActive = true;
            } else if (req.body.status === "BLOCKED") {
                isActive = false;
            } else {
                sendError(res, AppMessages.ERROR.INVALID_STATUS_OR_IS_ACTIVE, HttpStatusCode.BAD_REQUEST);
                return;
            }

            const category = await this._updateCategoryStatusUseCase.execute(
                categoryId,
                isActive
            );

            sendSuccess(res, category, undefined, HttpStatusCode.OK, { category });
        }
    );

    blockCategory = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const categoryId = req.params.categoryId as string;

            const category = await this._updateCategoryStatusUseCase.execute(
                categoryId,
                false
            );

            sendSuccess(res, category, undefined, HttpStatusCode.OK, { category });
        }
    );

    unblockCategory = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const categoryId = req.params.categoryId as string;

            const category = await this._updateCategoryStatusUseCase.execute(
                categoryId,
                true
            );

            sendSuccess(res, category, undefined, HttpStatusCode.OK, { category });
        }
    );

    getReviewEligibleIssues = asyncHandler(
        async (req: AuthRequest, res: Response): Promise<void> => {
            if (!req.user) {
                throw new ApiError(HttpStatusCode.UNAUTHORIZED, AppMessages.ERROR.UNAUTHORIZED);
            }

            if (!req.user.roles?.includes(Role.ADMIN)) {
                throw new ApiError(HttpStatusCode.FORBIDDEN, AppMessages.ERROR.FORBIDDEN);
            }

            if (req.query.page !== undefined) {
                const parsedPage = Number(req.query.page);
                if (!Number.isInteger(parsedPage) || parsedPage < 1) {
                    throw new ApiError(HttpStatusCode.BAD_REQUEST, "Page must be a positive integer");
                }
            }

            if (req.query.pageSize !== undefined) {
                const parsedPageSize = Number(req.query.pageSize);
                if (!Number.isInteger(parsedPageSize) || parsedPageSize < 1 || parsedPageSize > 100) {
                    throw new ApiError(HttpStatusCode.BAD_REQUEST, "Page size must be between 1 and 100");
                }
            }

            const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
            const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 10;
            const search = req.query.search as string | undefined;
            const status = req.query.status as string | undefined;
            const category = req.query.category as string | undefined;
            const visibility = req.query.visibility as string | undefined;

            const result = await this._getReviewEligibleIssuesUseCase.execute(
                page,
                pageSize,
                { search, status, category, visibility }
            );

            sendPaginated(res, result.items, result.pagination, "issues", HttpStatusCode.OK);
        }
    );

    approveIssue = asyncHandler(
        async (req: AuthRequest, res: Response): Promise<void> => {
            const issueId = req.params.issueId as string;
            const updatedIssue = await this._approveIssueUseCase.execute(issueId);

            sendSuccess(res, updatedIssue, AppMessages.SUCCESS.ISSUE_APPROVED, HttpStatusCode.OK, { issue: updatedIssue });
        }
    );

    rejectIssue = asyncHandler(
        async (req: AuthRequest, res: Response): Promise<void> => {
            const issueId = req.params.issueId as string;
            const { rejectionReason } = req.body;
            const updatedIssue = await this._rejectIssueUseCase.execute(issueId, rejectionReason);

            sendSuccess(res, updatedIssue, AppMessages.SUCCESS.ISSUE_REJECTED, HttpStatusCode.OK, { issue: updatedIssue });
        }
    );

    getIssueAIAnalysis = asyncHandler(
        async (req: AuthRequest, res: Response): Promise<void> => {
            if (!this._getIssueAIAnalysisUseCase) {
                throw new ApiError(HttpStatusCode.INTERNAL_SERVER_ERROR, "JanAI service not wired");
            }
            const issueId = req.params.issueId as string;
            const analysis = await this._getIssueAIAnalysisUseCase.execute(issueId);

            sendSuccess(res, analysis, undefined, HttpStatusCode.OK, { analysis });
        }
    );

    triggerIssueAIAnalysis = asyncHandler(
        async (req: AuthRequest, res: Response): Promise<void> => {
            if (!req.user) {
                throw new ApiError(HttpStatusCode.UNAUTHORIZED, AppMessages.ERROR.UNAUTHORIZED);
            }

            if (!req.user.roles?.includes(Role.ADMIN)) {
                throw new ApiError(HttpStatusCode.FORBIDDEN, AppMessages.ERROR.FORBIDDEN);
            }

            if (!this._analyzeIssueCommentsUseCase) {
                throw new ApiError(HttpStatusCode.INTERNAL_SERVER_ERROR, "JanAI service not wired");
            }

            const issueId = req.params.issueId as string;
            const analysis = await this._analyzeIssueCommentsUseCase.execute(issueId);

            sendSuccess(res, analysis, "JanAI community comment analysis completed", HttpStatusCode.OK, { analysis });
        }
    );

}
