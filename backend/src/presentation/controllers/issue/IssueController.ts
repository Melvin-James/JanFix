import type { Response } from "express";

import type { AuthRequest } from "../../../shared/types/AuthRequest.js";

import asyncHandler from "../../../shared/utils/asyncHandler.js";

import ApiError from "../../../shared/utils/apiError.js";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";
import { sendSuccess, sendPaginated, sendError } from "../../../shared/response/index.js";

import type { ICreateIssueUseCase } from "../../../application/use-cases/usecase interfaces/issue/ICreateIssueUseCase.js";

import type { IGetIssueByIdUseCase } from "../../../application/use-cases/usecase interfaces/issue/IGetIssueByIdUseCase.js";

import type { IGetUserIssuesUseCase } from "../../../application/use-cases/usecase interfaces/issue/IGetUserIssuesUseCase.js";

import type { IGetCategoriesUseCase } from "../../../application/use-cases/usecase interfaces/category/IGetCategoriesUseCase.js";

import type { IGetFeedIssuesUseCase } from "../../../application/use-cases/usecase interfaces/issue/IGetFeedIssuesUseCase.js";
import type { IAddIssueUpvoteUseCase } from "../../../application/use-cases/usecase interfaces/issue/IAddIssueUpvoteUseCase.js";
import type { IRemoveIssueUpvoteUseCase } from "../../../application/use-cases/usecase interfaces/issue/IRemoveIssueUpvoteUseCase.js";
import type { IGetIssueUpvoteStatusUseCase } from "../../../application/use-cases/usecase interfaces/issue/IGetIssueUpvoteStatusUseCase.js";
import type { ICreateIssueCommentUseCase } from "../../../application/use-cases/usecase interfaces/issue/ICreateIssueCommentUseCase.js";
import type { IGetIssueCommentsUseCase } from "../../../application/use-cases/usecase interfaces/issue/IGetIssueCommentsUseCase.js";

export class IssueController {

    constructor(

        private readonly _createIssueUseCase: ICreateIssueUseCase,

        private readonly _getIssueByIdUseCase: IGetIssueByIdUseCase,

        private readonly _getUserIssuesUseCase: IGetUserIssuesUseCase,

        private readonly _getCategoriesUseCase: IGetCategoriesUseCase,

        private readonly _getFeedIssuesUseCase: IGetFeedIssuesUseCase,

        private readonly _addIssueUpvoteUseCase: IAddIssueUpvoteUseCase,

        private readonly _removeIssueUpvoteUseCase: IRemoveIssueUpvoteUseCase,

        private readonly _getIssueUpvoteStatusUseCase: IGetIssueUpvoteStatusUseCase,

        private readonly _createIssueCommentUseCase: ICreateIssueCommentUseCase,

        private readonly _getIssueCommentsUseCase: IGetIssueCommentsUseCase

    ) { }

    createIssue = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const userId = req.user?.userId;
        if (!userId) {
            sendError(res, "Unauthorized", HttpStatusCode.UNAUTHORIZED);
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

        sendSuccess(res, issue, "Issue reported successfully", HttpStatusCode.CREATED, { issue });
    });

    getIssueById = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const userId = req.user?.userId;
        const userRoles = req.user?.roles;
        const issueId = req.params.issueId as string;
        const issue = await this._getIssueByIdUseCase.execute(issueId, userId, userRoles);

        sendSuccess(res, issue, undefined, HttpStatusCode.OK, { issue });
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

        sendPaginated(res, result.items, result.pagination, "issues", HttpStatusCode.OK);
    });

    getUserIssues = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const userId = req.user?.userId;
        if (!userId) {
            sendError(res, "Unauthorized", HttpStatusCode.UNAUTHORIZED);
            return;
        }

        const page = req.query.page ? Number.parseInt(req.query.page as string, 10) : 1;
        const pageSize = req.query.pageSize ? Number.parseInt(req.query.pageSize as string, 10) : 10;

        const filters = {
            status: typeof req.query.status === "string" ? req.query.status : undefined,
            visibility: typeof req.query.visibility === "string" ? req.query.visibility : undefined,
            category: typeof req.query.category === "string" ? req.query.category : undefined,
            search: typeof req.query.search === "string" ? req.query.search : undefined,
        };

        const result = await this._getUserIssuesUseCase.execute(userId, page, pageSize, filters);

        sendPaginated(res, result.items, result.pagination, "issues", HttpStatusCode.OK);
    });

    getActiveCategories = asyncHandler(async (_req: AuthRequest, res: Response): Promise<void> => {
        const result = await this._getCategoriesUseCase.execute();
        const activeCategories = Array.isArray(result)
            ? result.filter((cat) => cat.isActive)
            : result.items.filter((cat) => cat.isActive);

        sendSuccess(res, activeCategories, undefined, HttpStatusCode.OK, { categories: activeCategories });
    });

    addUpvote = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const userId = req.user?.userId;
        if (!userId) {
            sendError(res, "Unauthorized", HttpStatusCode.UNAUTHORIZED);
            return;
        }

        const issueId = req.params.issueId as string;
        const result = await this._addIssueUpvoteUseCase.execute(issueId, userId);

        sendSuccess(res, result, "Issue upvoted successfully", HttpStatusCode.OK, {
            hasUpvoted: result.hasUpvoted,
            upvoteCount: result.upvoteCount,
        });
    });

    removeUpvote = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const userId = req.user?.userId;
        if (!userId) {
            sendError(res, "Unauthorized", HttpStatusCode.UNAUTHORIZED);
            return;
        }

        const issueId = req.params.issueId as string;
        const result = await this._removeIssueUpvoteUseCase.execute(issueId, userId);

        sendSuccess(res, result, "Upvote removed successfully", HttpStatusCode.OK, {
            hasUpvoted: result.hasUpvoted,
            upvoteCount: result.upvoteCount,
        });
    });

    getUpvoteStatus = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const userId = req.user?.userId;
        const issueId = req.params.issueId as string;
        const result = await this._getIssueUpvoteStatusUseCase.execute(issueId, userId);

        sendSuccess(res, result, undefined, HttpStatusCode.OK, {
            hasUpvoted: result.hasUpvoted,
            upvoteCount: result.upvoteCount,
        });
    });

    createComment = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const userId = req.user?.userId;
        if (!userId) {
            sendError(res, "Unauthorized", HttpStatusCode.UNAUTHORIZED);
            return;
        }

        const issueId = req.params.issueId as string;
        const { body } = req.body;
        const comment = await this._createIssueCommentUseCase.execute(issueId, userId, body);

        sendSuccess(res, comment, "Comment added successfully", HttpStatusCode.CREATED, { comment });
    });

    getComments = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const userId = req.user?.userId;
        if (!userId) {
            sendError(res, "Unauthorized", HttpStatusCode.UNAUTHORIZED);
            return;
        }

        const issueId = req.params.issueId as string;

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

        const page = req.query.page ? Number.parseInt(req.query.page as string, 10) : 1;
        const pageSize = req.query.pageSize ? Number.parseInt(req.query.pageSize as string, 10) : 20;

        const result = await this._getIssueCommentsUseCase.execute(issueId, userId, page, pageSize);

        sendPaginated(res, result.items, result.pagination, "comments", HttpStatusCode.OK);
    });
}
