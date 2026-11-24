import { Router } from "express";

import { IssueRepository } from "../../infrastructure/repositories/IssueRepository.ts";

import { CategoryRepository } from "../../infrastructure/repositories/CategoryRepository.ts";

import { UserRepository } from "../../infrastructure/repositories/UserRepository.ts";

import { ProposalRepository } from "../../infrastructure/repositories/ProposalRepository.ts";

import { CreateIssueUseCase } from "../../application/use-cases/issue/CreateIssueUseCase.ts";

import { GetIssueByIdUseCase } from "../../application/use-cases/issue/GetIssueByIdUseCase.ts";

import { GetUserIssuesUseCase } from "../../application/use-cases/issue/GetUserIssuesUseCase.ts";

import { GetCategoriesUseCase } from "../../application/use-cases/category/GetCategoriesUseCase.ts";

import { GetFeedIssuesUseCase } from "../../application/use-cases/issue/GetFeedIssuesUseCase.ts";

import { IssueController } from "../controllers/issue/IssueController.ts";
import { donationController } from "./donationRoutes.ts";

import { IssueVoteRepository } from "../../infrastructure/repositories/IssueVoteRepository.ts";

import { AddIssueUpvoteUseCase } from "../../application/use-cases/issue/AddIssueUpvoteUseCase.ts";

import { RemoveIssueUpvoteUseCase } from "../../application/use-cases/issue/RemoveIssueUpvoteUseCase.ts";

import { GetIssueUpvoteStatusUseCase } from "../../application/use-cases/issue/GetIssueUpvoteStatusUseCase.ts";

import { IssueCommentRepository } from "../../infrastructure/repositories/IssueCommentRepository.ts";

import { CreateIssueCommentUseCase } from "../../application/use-cases/issue/CreateIssueCommentUseCase.ts";

import { GetIssueCommentsUseCase } from "../../application/use-cases/issue/GetIssueCommentsUseCase.ts";

import { createCommentValidator } from "../validators/issue/createCommentValidator.ts";

import { authenticate } from "../middlewares/authMiddleware.ts";

import { requireActiveMode } from "../middlewares/activeModeMiddleware.ts";

import { searchRateLimit } from "../middlewares/searchRateLimit.ts";

import validate from "../middlewares/validate.ts";

import { createIssueValidator } from "../validators/issue/createIssueValidator.ts";

import { ApiEndpoints } from "../../shared/constants/apiEndpoints.ts";

import { S3StorageService } from "../../infrastructure/storage/S3StorageService.ts";

const router = Router();

const issueRepository = new IssueRepository();

const categoryRepository = new CategoryRepository();

const userRepository = new UserRepository();

const proposalRepository = new ProposalRepository();

const storageService = new S3StorageService();

const createIssueUseCase = new CreateIssueUseCase(
    issueRepository,
    categoryRepository,
    userRepository,
    storageService
);

const getIssueByIdUseCase = new GetIssueByIdUseCase(
    issueRepository,
    storageService,
    proposalRepository,
    userRepository
);

const getUserIssuesUseCase = new GetUserIssuesUseCase(issueRepository, storageService);

const getCategoriesUseCase = new GetCategoriesUseCase(categoryRepository);

const getFeedIssuesUseCase = new GetFeedIssuesUseCase(issueRepository, storageService);

const issueVoteRepository = new IssueVoteRepository();

const addIssueUpvoteUseCase = new AddIssueUpvoteUseCase(issueRepository, issueVoteRepository);

const removeIssueUpvoteUseCase = new RemoveIssueUpvoteUseCase(issueRepository, issueVoteRepository);

const getIssueUpvoteStatusUseCase = new GetIssueUpvoteStatusUseCase(issueRepository, issueVoteRepository);

const issueCommentRepository = new IssueCommentRepository();

const createIssueCommentUseCase = new CreateIssueCommentUseCase(issueRepository, issueCommentRepository);

const getIssueCommentsUseCase = new GetIssueCommentsUseCase(issueRepository, issueCommentRepository);

const issueController = new IssueController(
    createIssueUseCase,
    getIssueByIdUseCase,
    getUserIssuesUseCase,
    getCategoriesUseCase,
    getFeedIssuesUseCase,
    addIssueUpvoteUseCase,
    removeIssueUpvoteUseCase,
    getIssueUpvoteStatusUseCase,
    createIssueCommentUseCase,
    getIssueCommentsUseCase
);

// Public / Feed endpoints (with optional auth for personal visibility rules)
// Get active categories for reporting/filtering issues
router.get(ApiEndpoints.ISSUES.CATEGORIES, authenticate, issueController.getActiveCategories);

// Get community issues feed / recent issues (rate-limited search & filter)
router.get(ApiEndpoints.ISSUES.ROOT, authenticate, requireActiveMode("USER"), searchRateLimit, issueController.getFeedIssues);

// Get community activities feed (rate-limited search & filter, isCommunityIssue: true)
router.get(ApiEndpoints.ISSUES.COMMUNITY_ACTIVITIES, authenticate, requireActiveMode("USER"), searchRateLimit, issueController.getCommunityActivities);

// Authenticated user endpoints
// Get authenticated user's reported issues
router.get(ApiEndpoints.ISSUES.MY_ISSUES, authenticate, requireActiveMode("USER"), issueController.getUserIssues);

// Create a new issue
router.post(ApiEndpoints.ISSUES.ROOT, authenticate, requireActiveMode("USER"), validate(createIssueValidator), issueController.createIssue);

// Issue upvote endpoints (authenticated, user mode)
router.post(ApiEndpoints.ISSUES.UPVOTE, authenticate, requireActiveMode("USER"), issueController.addUpvote);
router.delete(ApiEndpoints.ISSUES.UPVOTE, authenticate, requireActiveMode("USER"), issueController.removeUpvote);
router.get(ApiEndpoints.ISSUES.UPVOTE, authenticate, issueController.getUpvoteStatus);

// Issue comment endpoints (authenticated, user mode)
router.post(ApiEndpoints.ISSUES.COMMENTS, authenticate, requireActiveMode("USER"), validate(createCommentValidator), issueController.createComment);
router.get(ApiEndpoints.ISSUES.COMMENTS, authenticate, issueController.getComments);

// Get issue details by id (enforces visibility & authorization; guests can view public verified)
router.get(ApiEndpoints.ISSUES.BY_ID, authenticate, issueController.getIssueById);

// Public route: Get donations for an issue
router.get(ApiEndpoints.ISSUES.DONATIONS, donationController.getIssueDonations);

export default router;
