import { Router } from "express";
import { UserRepository } from "../../infrastructure/repositories/UserRepository.js";
import { CategoryRepository } from "../../infrastructure/repositories/CategoryRepository.js";
import { IssueRepository } from "../../infrastructure/repositories/IssueRepository.js";
import { IssueInterestRepository } from "../../infrastructure/repositories/IssueInterestRepository.js";
import { ProviderController } from "../controllers/provider/ProviderController.js";
import { SubmitProviderApplicationUseCase } from "../../application/use-cases/provider/SubmitProviderApplicationUseCase.js";
import { ResubmitProviderApplicationUseCase } from "../../application/use-cases/provider/ResubmitProviderApplicationUseCase.js";
import { GetProviderProfileUseCase } from "../../application/use-cases/provider/GetProviderProfileUseCase.js";
import { GetCategoriesUseCase } from "../../application/use-cases/category/GetCategoriesUseCase.js";
import { ActivateProviderUseCase } from "../../application/use-cases/provider/ActivateProviderUseCase.js";
import { GetProviderIssuesUseCase } from "../../application/use-cases/provider/GetProviderIssuesUseCase.js";
import { ExpressIssueInterestUseCase } from "../../application/use-cases/provider/ExpressIssueInterestUseCase.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validate.js";
import { providerApplicationSchema } from "../validators/provider/providerApplicationSchema.js";
import { ApiEndpoints } from "../../shared/constants/apiEndpoints.js";
import { S3StorageService } from "../../infrastructure/storage/S3StorageService.js";
import { requireActiveMode } from "../middlewares/activeModeMiddleware.js";

const router = Router();

const userRepository = new UserRepository();
const categoryRepository = new CategoryRepository();
const issueRepository = new IssueRepository();
const issueInterestRepository = new IssueInterestRepository();
const storageService = new S3StorageService();

const submitProviderApplicationUseCase = new SubmitProviderApplicationUseCase(
  userRepository,
  categoryRepository,
);
const resubmitProviderApplicationUseCase =
  new ResubmitProviderApplicationUseCase(userRepository, categoryRepository);
const getProviderProfileUseCase = new GetProviderProfileUseCase(userRepository, storageService);
const getCategoriesUseCase = new GetCategoriesUseCase(categoryRepository);
const activateProviderUseCase = new ActivateProviderUseCase(userRepository);
const getProviderIssuesUseCase = new GetProviderIssuesUseCase(issueRepository, issueInterestRepository, storageService);
const expressIssueInterestUseCase = new ExpressIssueInterestUseCase(issueRepository, issueInterestRepository);

const providerController = new ProviderController(
  submitProviderApplicationUseCase,
  resubmitProviderApplicationUseCase,
  getProviderProfileUseCase,
  getCategoriesUseCase,
  activateProviderUseCase,
  getProviderIssuesUseCase,
  expressIssueInterestUseCase,
);

// Get active categories for provider onboarding
router.get(
  ApiEndpoints.PROVIDER.CATEGORIES,
  authenticate,
  providerController.getCategories,
);

// Submit application after review page (User mode only)
router.post(
  ApiEndpoints.PROVIDER.ONBOARDING_SUBMIT,
  authenticate,
  requireActiveMode("USER"),
  validate(providerApplicationSchema),
  providerController.submit,
);

// Resubmit application for rejected providers (User mode only)
router.post(
  ApiEndpoints.PROVIDER.ONBOARDING_RESUBMIT,
  authenticate,
  requireActiveMode("USER"),
  validate(providerApplicationSchema),
  providerController.resubmit,
);

// Get provider profile after submission / status inspection
router.get(
  ApiEndpoints.PROVIDER.PROFILE,
  authenticate,
  requireActiveMode("USER"),
  providerController.getProfile,
);

// Activate provider account (Service Provider mode only)
router.post(
  ApiEndpoints.PROVIDER.ACTIVATE,
  authenticate,
  requireActiveMode("SERVICE_PROVIDER"),
  providerController.activate,
);

// Provider workspace: Eligible civic issues listing (Service Provider mode, activated account only)
router.get(
  ApiEndpoints.PROVIDER.ISSUES,
  authenticate,
  requireActiveMode("SERVICE_PROVIDER"),
  providerController.getIssues,
);

// Provider workspace: Express interest in an eligible issue (Service Provider mode, activated account only)
router.post(
  ApiEndpoints.PROVIDER.EXPRESS_INTEREST,
  authenticate,
  requireActiveMode("SERVICE_PROVIDER"),
  providerController.expressInterest,
);

export default router;
