import { Router } from "express";
import { UserRepository } from "../../infrastructure/repositories/UserRepository.js";
import { CategoryRepository } from "../../infrastructure/repositories/CategoryRepository.js";
import { ProviderController } from "../controllers/provider/ProviderController.js";
import { SubmitProviderApplicationUseCase } from "../../application/use-cases/provider/SubmitProviderApplicationUseCase.js";
import { ResubmitProviderApplicationUseCase } from "../../application/use-cases/provider/ResubmitProviderApplicationUseCase.js";
import { GetProviderProfileUseCase } from "../../application/use-cases/provider/GetProviderProfileUseCase.js";
import { GetCategoriesUseCase } from "../../application/use-cases/category/GetCategoriesUseCase.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validate.js";
import { providerApplicationSchema } from "../validators/provider/providerApplicationSchema.js";
import { ApiEndpoints } from "../../shared/constants/apiEndpoints.js";
import { S3StorageService } from "../../infrastructure/storage/S3StorageService.js";

const router = Router();

const userRepository = new UserRepository();
const categoryRepository = new CategoryRepository();
const storageService = new S3StorageService();

const submitProviderApplicationUseCase = new SubmitProviderApplicationUseCase(
  userRepository,
  categoryRepository,
);
const resubmitProviderApplicationUseCase =
  new ResubmitProviderApplicationUseCase(userRepository, categoryRepository);
const getProviderProfileUseCase = new GetProviderProfileUseCase(userRepository, storageService);
const getCategoriesUseCase = new GetCategoriesUseCase(categoryRepository);

const providerController = new ProviderController(
  submitProviderApplicationUseCase,
  resubmitProviderApplicationUseCase,
  getProviderProfileUseCase,
  getCategoriesUseCase,
);

// Get active categories for provider onboarding
router.get(
  ApiEndpoints.PROVIDER.CATEGORIES,
  authenticate,
  providerController.getCategories,
);

// Submit application after review page
router.post(
  ApiEndpoints.PROVIDER.ONBOARDING_SUBMIT,
  authenticate,
  validate(providerApplicationSchema),
  providerController.submit,
);

// Resubmit application (for rejected providers)
router.post(
  ApiEndpoints.PROVIDER.ONBOARDING_RESUBMIT,
  authenticate,
  validate(providerApplicationSchema),
  providerController.resubmit,
);

// Get provider profile after submission / dashboard
router.get(
  ApiEndpoints.PROVIDER.PROFILE,
  authenticate,
  providerController.getProfile,
);

export default router;
