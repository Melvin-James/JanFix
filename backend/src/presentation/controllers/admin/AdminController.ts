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

import type { IDeleteCategoryUseCase } from "../../../application/use-cases/usecase interfaces/category/IDeleteCategoryUseCase.js";

import { AppMessages } from "../../../shared/constants/messages.js";

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

        private readonly _deleteCategoryUseCase: IDeleteCategoryUseCase,

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

            res.status(HttpStatusCode.OK).json({
                success: true,
                applications: result.items,
                pagination: result.pagination,
            });
        }
    );

    getProviderApplicationDetails = asyncHandler(
        async (req: AuthRequest, res: Response): Promise<void> => {

            const userId = req.params.userId as string;

            const application = await this._getProviderApplicationDetailUseCase.execute(userId);

            res.status(HttpStatusCode.OK).json({
                success: true,
                application,
            });
        }
    );

    approveProviderApplication = asyncHandler(
        async (req: AuthRequest, res: Response): Promise<void> => {

            const userId = req.params.userId as string;

            await this._approveProviderApplicationUseCase.execute(userId);

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: AppMessages.SUCCESS.PROVIDER_APPLICATION_APPROVED
            })
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

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: AppMessages.SUCCESS.PROVIDER_APPLICATION_REJECTED
            });
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

            res.status(HttpStatusCode.OK).json({
                success: true,
                providers: result.items,
                pagination: result.pagination,
            });
        }
    );

    getServiceProviderDetails = asyncHandler(
        async (
            req: AuthRequest,
            res: Response
        ): Promise<void> => {

            const userId = req.params.userId as string;

            const provider = await this._getServiceProviderDetailsUseCase.execute(userId);

            res.status(HttpStatusCode.OK).json({
                success: true,
                provider,
            })
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

            res.status(HttpStatusCode.OK).json({

                success: true,

                provider,

            });

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

            res.status(HttpStatusCode.OK).json({
                success: true,
                users: result.items,
                pagination: result.pagination,
            });
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

            res.status(HttpStatusCode.OK).json({
                success: true,
                user,
            });
        }
    );

    createCategory = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {

            const category = await this._createCategoryUseCase.execute(
                req.body
            );

            res.status(HttpStatusCode.CREATED).json({
                success: true,
                category,
            })
        }
    )

    getCategories = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
            const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : undefined;
            const search = req.query.search as string | undefined;
            const status = req.query.status as string | undefined;

            if (page !== undefined && pageSize !== undefined) {
                const result = await this._getCategoriesUseCase.execute(
                    page,
                    pageSize,
                    { search, status }
                );

                if ("items" in result) {
                    res.status(HttpStatusCode.OK).json({
                        success: true,
                        categories: result.items,
                        pagination: result.pagination,
                    });
                    return;
                }
            }

            const categories = await this._getCategoriesUseCase.execute();

            res.status(HttpStatusCode.OK).json({
                success: true,
                categories,
            });
        }
    );


    updateCategory = asyncHandler(
        async(req: Request, res: Response): Promise<void> => {

            const categoryId = req.params.categoryId as string;

            const category = await this._updateCategoryUseCase.execute(
                categoryId,
                req.body
            );

            res.status(HttpStatusCode.OK).json({
                success: true,
                category,
            });

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
                res.status(HttpStatusCode.BAD_REQUEST).json({
                    success: false,
                    message: AppMessages.ERROR.INVALID_STATUS_OR_IS_ACTIVE,
                });
                return;
            }

            const category = await this._updateCategoryStatusUseCase.execute(
                categoryId,
                isActive
            );

            res.status(HttpStatusCode.OK).json({
                success: true,
                category,
            });
        }
    );

    blockCategory = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const categoryId = req.params.categoryId as string;

            const category = await this._updateCategoryStatusUseCase.execute(
                categoryId,
                false
            );

            res.status(HttpStatusCode.OK).json({
                success: true,
                category,
            });
        }
    );

    unblockCategory = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const categoryId = req.params.categoryId as string;

            const category = await this._updateCategoryStatusUseCase.execute(
                categoryId,
                true
            );

            res.status(HttpStatusCode.OK).json({
                success: true,
                category,
            });
        }
    );

    deleteCategory = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const categoryId = req.params.categoryId as string;

            await this._deleteCategoryUseCase.execute(categoryId);

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: AppMessages.SUCCESS.CATEGORY_DELETED,
            });
        }
    );

}
