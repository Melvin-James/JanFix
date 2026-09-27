import type { Request, Response } from "express";

import type { AuthRequest } from "../../../shared/types/AuthRequest.js";

import asyncHandler from "../../../shared/utils/asyncHandler.js";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

import type { IGetProviderApplicationsUseCase } from "../../../application/use-cases/usecase interfaces/IGetProviderApplicationsUseCase.js";

import type { IGetProviderApplicationDetailsUseCase } from "../../../application/use-cases/usecase interfaces/IGetProviderApplicationDetailsUseCase.js";

import type { IApproveProviderApplicationUseCase } from "../../../application/use-cases/usecase interfaces/IApproveProviderApplicationUseCase.js";

import type { IRejectProviderApplicationUseCase } from "../../../application/use-cases/usecase interfaces/IRejectProviderApplicationUseCase.js";

import type { IGetServiceProvidersUseCase } from "../../../application/use-cases/usecase interfaces/IGetServiceProvidersUseCase.js";

import type { IGetServiceProviderDetailsUseCase } from "../../../application/use-cases/usecase interfaces/IGetServiceProviderDetailsUseCase.js";

import type { IUpdateServiceProviderStatusUseCase } from "../../../application/use-cases/usecase interfaces/IUpdateServiceProviderStatusUseCase.js";

import type { IGetUsersForManagementUseCase } from "../../../application/use-cases/usecase interfaces/IGetUsersForManagementUseCase.js";

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

        async (
            _req: AuthRequest,
            res: Response
        ): Promise<void> => {


            const applications = await this._getProviderApplicationUseCase.execute();

            res.status(
                HttpStatusCode.OK
            )
                .json({
                    success: true,
                    applications
                });

        }
    );

    getProviderApplicationDetails = asyncHandler(
        async (req: AuthRequest, res: Response): Promise<void> => {

            const userId = req.params.userId;

            if (typeof userId !== "string") {
                res.status(HttpStatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Invalid user ID."
                });
                return;
            }

            const application = await this._getProviderApplicationDetailUseCase.execute(userId);

            res.status(HttpStatusCode.OK).json({
                success: true,
                application,
            });
        }
    );

    approveProviderApplication = asyncHandler(
        async (req: AuthRequest, res: Response): Promise<void> => {

            const userId = req.params.userId;

            if (typeof userId !== 'string') {
                res.status(HttpStatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Invalid user ID"
                });
                return;
            }

            await this._approveProviderApplicationUseCase.execute(userId);

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: "Provider application approved succesfuly"
            })
        }
    )

    rejectProviderApplication = asyncHandler(
        async (req: AuthRequest, res: Response): Promise<void> => {


            const userId = req.params.userId;

            if (typeof userId !== 'string') {
                res.status(HttpStatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Invalid user ID."
                });
                return;
            }

            const { rejectionReason } = req.body;

            await this._rejectProviderApplicationUseCase.execute(
                userId,
                rejectionReason
            );

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: "Provider application rejected successfully."
            });
        }
    )

    getServiceProviders = asyncHandler(
        async (
            _req: AuthRequest,
            res: Response
        ): Promise<void> => {
            const providers = await this._getServiceProvidersUseCase.execute();

            res.status(HttpStatusCode.OK).json({
                success: true,
                providers
            });
        }
    );

    getServiceProviderDetails = asyncHandler(
        async (
            req: AuthRequest,
            res: Response
        ): Promise<void> => {

            const userId = req.params.userId;

            if (typeof userId !== "string") {
                res.status(HttpStatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Invalid user ID"
                });
                return;
            }

            const provider = await this._getServiceProviderDetailsUseCase.execute(userId);

            res.status(HttpStatusCode.OK).json({
                success: true,
                provider,
            })
        }
    )

    updateServiceProviderStatus = asyncHandler(

        async (req: Request, res: Response) => {

            const userId = req.params.userId;

            if (typeof userId !== "string") {

                res.status(HttpStatusCode.BAD_REQUEST).json({

                    success: false,

                    message: "Invalid service provider id",

                });

                return;

            }

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

        async (_req: Request, res: Response) => {

            const users = await this._getUsersForManagementUseCase.execute();

            res.status(HttpStatusCode.OK).json({

                success: true,

                users

            });
        }
    );

    updateUserAccountStatus = asyncHandler(
        async (req: Request, res: Response) => {
            const userId = req.params.userId;

            if (typeof userId !== "string") {
                res.status(HttpStatusCode.INVALID).json({
                    success: false,
                    message: "Invalid user id",
                });
                return;
            }

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
        async (_req: Request, res: Response): Promise<void> => {

            const categories = await this._getCategoriesUseCase.execute();

            res.status(HttpStatusCode.OK).json({
                success: true,
                categories,
            });
        }
    );

    updateCategory = asyncHandler(
        async(req: Request, res: Response): Promise<void> => {

            const categoryId = req.params.categoryId;

            if(typeof categoryId !== "string") {
                res.status(HttpStatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Invalid category ID",
                });
                return;
            }

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
            const categoryId = req.params.categoryId;

            if (typeof categoryId !== "string") {
                res.status(HttpStatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Invalid category ID",
                });
                return;
            }

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
                    message: "Invalid status or isActive value",
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
            const categoryId = req.params.categoryId;

            if (typeof categoryId !== "string") {
                res.status(HttpStatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Invalid category ID",
                });
                return;
            }

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
            const categoryId = req.params.categoryId;

            if (typeof categoryId !== "string") {
                res.status(HttpStatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Invalid category ID",
                });
                return;
            }

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
            const categoryId = req.params.categoryId;

            if (typeof categoryId !== "string") {
                res.status(HttpStatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Invalid category ID",
                });
                return;
            }

            await this._deleteCategoryUseCase.execute(categoryId);

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: AppMessages.SUCCESS.CATEGORY_DELETED,
            });
        }
    );

}
