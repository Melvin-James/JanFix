import type { Response } from "express";

import type { AuthRequest } from "../../../shared/types/AuthRequest.js";

import asyncHandler from "../../../shared/utils/asyncHandler.js";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

import type { ICreateIssueUseCase } from "../../../application/use-cases/usecase interfaces/issue/ICreateIssueUseCase.js";

import type { IGetIssueByIdUseCase } from "../../../application/use-cases/usecase interfaces/issue/IGetIssueByIdUseCase.js";

import type { IGetUserIssuesUseCase } from "../../../application/use-cases/usecase interfaces/issue/IGetUserIssuesUseCase.js";

import type { IGetCategoriesUseCase } from "../../../application/use-cases/usecase interfaces/category/IGetCategoriesUseCase.js";

import type { IGetFeedIssuesUseCase } from "../../../application/use-cases/usecase interfaces/issue/IGetFeedIssuesUseCase.js";

export class IssueController {

    constructor(

        private readonly _createIssueUseCase: ICreateIssueUseCase,

        private readonly _getIssueByIdUseCase: IGetIssueByIdUseCase,

        private readonly _getUserIssuesUseCase: IGetUserIssuesUseCase,

        private readonly _getCategoriesUseCase: IGetCategoriesUseCase,

        private readonly _getFeedIssuesUseCase: IGetFeedIssuesUseCase

    ) { }

    createIssue = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(HttpStatusCode.UNAUTHORIZED).json({
                success: false,
                message: "Unauthorized",
            });
            return;
        }

        const { title, description, categoryId, images, visibility, location } = req.body;

        const issue = await this._createIssueUseCase.execute({
            createdBy: userId,
            title,
            description,
            categoryId,
            images,
            visibility,
            location,
        });

        res.status(HttpStatusCode.CREATED).json({
            success: true,
            message: "Issue reported successfully",
            issue,
        });
    });

    getIssueById = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const userId = req.user?.userId;
        const issueId = req.params.issueId as string;
        const issue = await this._getIssueByIdUseCase.execute(issueId, userId);

        res.status(HttpStatusCode.OK).json({
            success: true,
            issue,
        });
    });

    getFeedIssues = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const userId = req.user?.userId;
        const page = req.query.page ? Number.parseInt(req.query.page as string, 10) : 1;
        const pageSize = req.query.pageSize ? Number.parseInt(req.query.pageSize as string, 10) : 10;

        const filters = {
            status: typeof req.query.status === "string" ? req.query.status : undefined,
            visibility: typeof req.query.visibility === "string" ? req.query.visibility : undefined,
            category: typeof req.query.category === "string" ? req.query.category : undefined,
            search: typeof req.query.search === "string" ? req.query.search : undefined,
        };

        const result = await this._getFeedIssuesUseCase.execute(userId, page, pageSize, filters);

        res.status(HttpStatusCode.OK).json({
            success: true,
            issues: result.items,
            pagination: result.pagination,
        });
    });

    getUserIssues = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(HttpStatusCode.UNAUTHORIZED).json({
                success: false,
                message: "Unauthorized",
            });
            return;
        }

        const page = req.query.page ? Number.parseInt(req.query.page as string, 10) : 1;
        const pageSize = req.query.pageSize ? Number.parseInt(req.query.pageSize as string, 10) : 10;

        const result = await this._getUserIssuesUseCase.execute(userId, page, pageSize);

        res.status(HttpStatusCode.OK).json({
            success: true,
            issues: result.items,
            pagination: result.pagination,
        });
    });

    getActiveCategories = asyncHandler(async (_req: AuthRequest, res: Response): Promise<void> => {
        const result = await this._getCategoriesUseCase.execute();
        const activeCategories = Array.isArray(result)
            ? result.filter((cat) => cat.isActive)
            : result.items.filter((cat) => cat.isActive);

        res.status(HttpStatusCode.OK).json({
            success: true,
            categories: activeCategories,
        });
    });
}
