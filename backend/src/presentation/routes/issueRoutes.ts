import { Router } from "express";
import { IssueRepository } from "../../infrastructure/repositories/IssueRepository.js";
import { CategoryRepository } from "../../infrastructure/repositories/CategoryRepository.js";
import { UserRepository } from "../../infrastructure/repositories/UserRepository.js";
import { CreateIssueUseCase } from "../../application/use-cases/issue/CreateIssueUseCase.js";
import { GetIssueByIdUseCase } from "../../application/use-cases/issue/GetIssueByIdUseCase.js";
import { GetUserIssuesUseCase } from "../../application/use-cases/issue/GetUserIssuesUseCase.js";
import { GetCategoriesUseCase } from "../../application/use-cases/category/GetCategoriesUseCase.js";
import { IssueController } from "../controllers/issue/IssueController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validate.js";
import { createIssueValidator } from "../validators/issue/createIssueValidator.js";
import { ApiEndpoints } from "../../shared/constants/apiEndpoints.js";

const router = Router();

const issueRepository = new IssueRepository();
const categoryRepository = new CategoryRepository();
const userRepository = new UserRepository();

const createIssueUseCase = new CreateIssueUseCase(
    issueRepository,
    categoryRepository,
    userRepository
);
const getIssueByIdUseCase = new GetIssueByIdUseCase(issueRepository);
const getUserIssuesUseCase = new GetUserIssuesUseCase(issueRepository);
const getCategoriesUseCase = new GetCategoriesUseCase(categoryRepository);

const issueController = new IssueController(
    createIssueUseCase,
    getIssueByIdUseCase,
    getUserIssuesUseCase,
    getCategoriesUseCase
);

// All issue endpoints require authentication
router.use(authenticate);

// Get active categories for reporting issues
router.get(ApiEndpoints.ISSUES.CATEGORIES, issueController.getActiveCategories);

// Get authenticated user's reported issues
router.get(ApiEndpoints.ISSUES.MY_ISSUES, issueController.getUserIssues);

// Create a new issue
router.post(
    ApiEndpoints.ISSUES.ROOT,
    validate(createIssueValidator),
    issueController.createIssue
);

// Get issue details by id (enforces visibility & authorization)
router.get(ApiEndpoints.ISSUES.BY_ID, issueController.getIssueById);

export default router;
