import { Router } from "express";
import { UserRepository } from "../../infrastructure/repositories/UserRepository.ts";
import { CategoryRepository } from "../../infrastructure/repositories/CategoryRepository.ts";
import { IssueRepository } from "../../infrastructure/repositories/IssueRepository.ts";
import { IssueInterestRepository } from "../../infrastructure/repositories/IssueInterestRepository.ts";
import { ProposalRepository } from "../../infrastructure/repositories/ProposalRepository.ts";
import { ProviderController } from "../controllers/provider/ProviderController.ts";
import { SubmitProviderApplicationUseCase } from "../../application/use-cases/provider/SubmitProviderApplicationUseCase.ts";
import { ResubmitProviderApplicationUseCase } from "../../application/use-cases/provider/ResubmitProviderApplicationUseCase.ts";
import { GetProviderProfileUseCase } from "../../application/use-cases/provider/GetProviderProfileUseCase.ts";
import { GetCategoriesUseCase } from "../../application/use-cases/category/GetCategoriesUseCase.ts";
import { ActivateProviderUseCase } from "../../application/use-cases/provider/ActivateProviderUseCase.ts";
import { GetProviderIssuesUseCase } from "../../application/use-cases/provider/GetProviderIssuesUseCase.ts";
import { ExpressIssueInterestUseCase } from "../../application/use-cases/provider/ExpressIssueInterestUseCase.ts";
import { GetProviderIssueDetailsUseCase } from "../../application/use-cases/provider/GetProviderIssueDetailsUseCase.ts";
import { SubmitProposalUseCase } from "../../application/use-cases/provider/SubmitProposalUseCase.ts";
import { GetProviderProposalUseCase } from "../../application/use-cases/provider/GetProviderProposalUseCase.ts";
import { UpdateProposalUseCase } from "../../application/use-cases/provider/UpdateProposalUseCase.ts";
import { WithdrawProposalUseCase } from "../../application/use-cases/provider/WithdrawProposalUseCase.ts";
import { authenticate, requireActiveProvider } from "../middlewares/authMiddleware.ts";
import validate from "../middlewares/validate.ts";
import { providerApplicationSchema } from "../validators/provider/providerApplicationSchema.ts";
import { activateProviderSchema } from "../validators/provider/activateProviderValidator.ts";
import { submitProposalSchema, updateProposalSchema } from "../validators/provider/proposalValidators.ts";
import { ApiEndpoints } from "../../shared/constants/apiEndpoints.ts";
import { S3StorageService } from "../../infrastructure/storage/S3StorageService.ts";
import { requireActiveMode } from "../middlewares/activeModeMiddleware.ts";

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

const getProviderIssuesUseCase = new GetProviderIssuesUseCase(issueRepository, proposalRepository, storageService,userRepository);
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
