import { Router } from "express";

import { IssueRepository } from "../../infrastructure/repositories/IssueRepository.js";

import { CategoryRepository } from "../../infrastructure/repositories/CategoryRepository.js";

import { UserRepository } from "../../infrastructure/repositories/UserRepository.js";

import { CreateIssueUseCase } from "../../application/use-cases/issue/CreateIssueUseCase.js";

import { GetIssueByIdUseCase } from "../../application/use-cases/issue/GetIssueByIdUseCase.js";

import { GetUserIssuesUseCase } from "../../application/use-cases/issue/GetUserIssuesUseCase.js";

import { GetCategoriesUseCase } from "../../application/use-cases/category/GetCategoriesUseCase.js";

import { GetFeedIssuesUseCase } from "../../application/use-cases/issue/GetFeedIssuesUseCase.js";

import { IssueController } from "../controllers/issue/IssueController.js";

import { authenticate } from "../middlewares/authMiddleware.js";

import { searchRateLimit } from "../middlewares/searchRateLimit.js";

import validate from "../middlewares/validate.js";

import { createIssueValidator } from "../validators/issue/createIssueValidator.js";

import { ApiEndpoints } from "../../shared/constants/apiEndpoints.js";

import { S3StorageService } from "../../infrastructure/storage/S3StorageService.js";

const router = Router();

const issueRepository = new IssueRepository();

const categoryRepository = new CategoryRepository();

const userRepository = new UserRepository();

const storageService = new S3StorageService();

const createIssueUseCase = new CreateIssueUseCase(
    issueRepository,
    categoryRepository,
    userRepository,
    storageService
);

const getIssueByIdUseCase = new GetIssueByIdUseCase(issueRepository, storageService);

const getUserIssuesUseCase = new GetUserIssuesUseCase(issueRepository, storageService);

const getCategoriesUseCase = new GetCategoriesUseCase(categoryRepository);

const getFeedIssuesUseCase = new GetFeedIssuesUseCase(issueRepository, storageService);

const issueController = new IssueController(
    createIssueUseCase,
    getIssueByIdUseCase,
    getUserIssuesUseCase,
    getCategoriesUseCase,
    getFeedIssuesUseCase
);

// Public / Feed endpoints (with optional auth for personal visibility rules)
// Get active categories for reporting/filtering issues
router.get(ApiEndpoints.ISSUES.CATEGORIES, authenticate, issueController.getActiveCategories);

// Get community issues feed / recent issues (rate-limited search & filter)
router.get(ApiEndpoints.ISSUES.ROOT, authenticate, searchRateLimit, issueController.getFeedIssues);

// Authenticated user endpoints
// Get authenticated user's reported issues
router.get(ApiEndpoints.ISSUES.MY_ISSUES, authenticate, issueController.getUserIssues);

// Create a new issue
router.post(ApiEndpoints.ISSUES.ROOT, authenticate, validate(createIssueValidator), issueController.createIssue);

// Get issue details by id (enforces visibility & authorization; guests can view public verified)
router.get(ApiEndpoints.ISSUES.BY_ID, authenticate, issueController.getIssueById);

export default router;
