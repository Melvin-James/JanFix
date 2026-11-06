import { Router } from "express";
import { UserRepository } from "../../infrastructure/repositories/UserRepository.js";
import { CategoryRepository } from "../../infrastructure/repositories/CategoryRepository.js";
import { IssueRepository } from "../../infrastructure/repositories/IssueRepository.js";
import { IssueInterestRepository } from "../../infrastructure/repositories/IssueInterestRepository.js";
import { ProposalRepository } from "../../infrastructure/repositories/ProposalRepository.js";
import { ProviderController } from "../controllers/provider/ProviderController.js";
import { SubmitProviderApplicationUseCase } from "../../application/use-cases/provider/SubmitProviderApplicationUseCase.js";
import { ResubmitProviderApplicationUseCase } from "../../application/use-cases/provider/ResubmitProviderApplicationUseCase.js";
import { GetProviderProfileUseCase } from "../../application/use-cases/provider/GetProviderProfileUseCase.js";
import { GetCategoriesUseCase } from "../../application/use-cases/category/GetCategoriesUseCase.js";
import { ActivateProviderUseCase } from "../../application/use-cases/provider/ActivateProviderUseCase.js";
import { GetProviderIssuesUseCase } from "../../application/use-cases/provider/GetProviderIssuesUseCase.js";
import { ExpressIssueInterestUseCase } from "../../application/use-cases/provider/ExpressIssueInterestUseCase.js";
import { GetProviderIssueDetailsUseCase } from "../../application/use-cases/provider/GetProviderIssueDetailsUseCase.js";
import { SubmitProposalUseCase } from "../../application/use-cases/provider/SubmitProposalUseCase.js";
import { GetProviderProposalUseCase } from "../../application/use-cases/provider/GetProviderProposalUseCase.js";
import { UpdateProposalUseCase } from "../../application/use-cases/provider/UpdateProposalUseCase.js";
import { WithdrawProposalUseCase } from "../../application/use-cases/provider/WithdrawProposalUseCase.js";
import { authenticate, requireActiveProvider } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validate.js";
import { providerApplicationSchema } from "../validators/provider/providerApplicationSchema.js";
import { activateProviderSchema } from "../validators/provider/activateProviderValidator.js";
import { submitProposalSchema, updateProposalSchema } from "../validators/provider/proposalValidators.js";
import { ApiEndpoints } from "../../shared/constants/apiEndpoints.js";
import { S3StorageService } from "../../infrastructure/storage/S3StorageService.js";
import { requireActiveMode } from "../middlewares/activeModeMiddleware.js";

const router = Router();

const userRepository = new UserRepository();
const categoryRepository = new CategoryRepository();
const issueRepository = new IssueRepository();
const issueInterestRepository = new IssueInterestRepository();
const proposalRepository = new ProposalRepository();
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

const getProviderIssuesUseCase = new GetProviderIssuesUseCase(issueRepository, proposalRepository, storageService);
const expressIssueInterestUseCase = new ExpressIssueInterestUseCase(issueRepository, issueInterestRepository);
const getProviderIssueDetailsUseCase = new GetProviderIssueDetailsUseCase(issueRepository, proposalRepository, storageService);

const submitProposalUseCase = new SubmitProposalUseCase(issueRepository, proposalRepository, userRepository);
const getProviderProposalUseCase = new GetProviderProposalUseCase(proposalRepository);
const updateProposalUseCase = new UpdateProposalUseCase(issueRepository, proposalRepository);
const withdrawProposalUseCase = new WithdrawProposalUseCase(issueRepository, proposalRepository);

const providerController = new ProviderController(
  submitProviderApplicationUseCase,
  resubmitProviderApplicationUseCase,
  getProviderProfileUseCase,
  getCategoriesUseCase,
  activateProviderUseCase,
  getProviderIssuesUseCase,
  expressIssueInterestUseCase,
  getProviderIssueDetailsUseCase,
  submitProposalUseCase,
  getProviderProposalUseCase,
  updateProposalUseCase,
  withdrawProposalUseCase,
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

// Activate provider account (Service Provider mode only, submits payout details)
router.post(
  ApiEndpoints.PROVIDER.ACTIVATE,
  authenticate,
  requireActiveMode("SERVICE_PROVIDER"),
  validate(activateProviderSchema),
  providerController.activate,
);

// Provider workspace: Eligible civic issues listing (Service Provider mode, activated account only)
router.get(
  ApiEndpoints.PROVIDER.ISSUES,
  authenticate,
  requireActiveMode("SERVICE_PROVIDER"),
  requireActiveProvider,
  providerController.getIssues,
);

// Provider workspace: Issue details (Service Provider mode, activated account only)
router.get(
  ApiEndpoints.PROVIDER.ISSUE_DETAILS,
  authenticate,
  requireActiveMode("SERVICE_PROVIDER"),
  requireActiveProvider,
  providerController.getIssueDetails,
);

// Provider workspace: Submit structured proposal for an issue
router.post(
  ApiEndpoints.PROVIDER.PROPOSALS,
  authenticate,
  requireActiveMode("SERVICE_PROVIDER"),
  requireActiveProvider,
  validate(submitProposalSchema),
  providerController.submitProposal,
);

// Provider workspace: Retrieve own proposal for an issue
router.get(
  ApiEndpoints.PROVIDER.MY_PROPOSAL,
  authenticate,
  requireActiveMode("SERVICE_PROVIDER"),
  requireActiveProvider,
  providerController.getMyProposal,
);

// Provider workspace: Update own proposal for an issue
router.put(
  ApiEndpoints.PROVIDER.MY_PROPOSAL,
  authenticate,
  requireActiveMode("SERVICE_PROVIDER"),
  requireActiveProvider,
  validate(updateProposalSchema),
  providerController.updateProposal,
);

// Provider workspace: Withdraw own proposal for an issue
router.delete(
  ApiEndpoints.PROVIDER.MY_PROPOSAL,
  authenticate,
  requireActiveMode("SERVICE_PROVIDER"),
  requireActiveProvider,
  providerController.withdrawProposal,
);

// Deprecated Express Interest endpoint (preserved for backwards compatibility during migration)
router.post(
  ApiEndpoints.PROVIDER.EXPRESS_INTEREST,
  authenticate,
  requireActiveMode("SERVICE_PROVIDER"),
  requireActiveProvider,
  providerController.expressInterest,
);

export default router;
