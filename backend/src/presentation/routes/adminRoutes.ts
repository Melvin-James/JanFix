import { Router } from "express";

import { UserRepository } from "../../infrastructure/repositories/UserRepository.ts";

import { GetProviderApplicationsUseCase } from "../../application/use-cases/provider/GetProviderApplicationsUseCase.ts";

import { AdminController } from "../controllers/admin/AdminController.ts";

import { authenticate } from "../middlewares/authMiddleware.ts";

import { authorizeRoles } from "../middlewares/roleMiddleware.ts";

import { searchRateLimit } from "../middlewares/searchRateLimit.ts";

import { Role } from "../../domain/enums/Role.ts";

import { GetProviderApplicationDetailsUseCase } from "../../application/use-cases/provider/GetProviderApplicationDetailsUseCase.ts";

import { ApproveProviderApplicationUseCase } from "../../application/use-cases/admin/ApproveProviderApplicationUseCase.ts";

import { RejectProviderApplicationUseCase } from "../../application/use-cases/admin/RejectProviderApplicationUseCase.ts";

import { GetServiceProvidersUseCase } from "../../application/use-cases/admin/GetServiceProvidersUseCase.ts";

import { GetServiceProviderDetailsUseCase } from "../../application/use-cases/admin/GetServiceProviderDetailsUseCase.ts";

import { UpdateServiceProviderStatusUseCase } from "../../application/use-cases/admin/UpdateServiceProviderStatusUseCase.ts";

import validate from "../middlewares/validate.ts";

import { rejectProviderApplicationSchema } from "../validators/admin/rejectProviderApplicationValidator.ts";

import { updateServiceProviderStatusSchema } from "../validators/admin/UpdateServiceProviderStatusValidator.ts";

import { updateUserAccountStatusSchema } from "../validators/admin/updateUserAccountStatusValidator.ts";

import { GetUsersForManagementUseCase } from "../../application/use-cases/admin/GetUsersForManagementUseCase.ts";

import { UpdateUserAccountStatusUseCase } from "../../application/use-cases/admin/UpdateUserAccountStatusUseCase.ts";

import { CreateCategoryUseCase } from "../../application/use-cases/category/CreateCategoryUseCase.ts";

import { CategoryRepository } from "../../infrastructure/repositories/CategoryRepository.ts";

import {
  createCategorySchema,
  updateCategorySchema,
  updateCategoryStatusSchema,
} from "../validators/category/categoryValidator.ts";

import { GetCategoriesUseCase } from "../../application/use-cases/category/GetCategoriesUseCase.ts";

import { UpdateCategoryUseCase } from "../../application/use-cases/category/UpdateCategoryUseCase.ts";

import { UpdateCategoryStatusUseCase } from "../../application/use-cases/category/UpdateCategoryStatusUseCase.ts";

import { ApiEndpoints } from "../../shared/constants/apiEndpoints.ts";
import { S3StorageService } from "../../infrastructure/storage/S3StorageService.ts";
import { IssueRepository } from "../../infrastructure/repositories/IssueRepository.ts";
import { IssueAIAnalysisRepository } from "../../infrastructure/repositories/IssueAIAnalysisRepository.ts";
import { GeminiIssueAIService } from "../../infrastructure/services/GeminiIssueAIService.ts";
import { GetReviewEligibleIssuesUseCase } from "../../application/use-cases/admin/GetReviewEligibleIssuesUseCase.ts";
import { ApproveIssueUseCase } from "../../application/use-cases/admin/ApproveIssueUseCase.ts";
import { RejectIssueUseCase } from "../../application/use-cases/admin/RejectIssueUseCase.ts";
import { GetIssueAIAnalysisUseCase } from "../../application/use-cases/admin/GetIssueAIAnalysisUseCase.ts";
import { AnalyzeIssueCommentsUseCase } from "../../application/use-cases/admin/AnalyzeIssueCommentsUseCase.ts";
import { rejectIssueSchema } from "../validators/admin/rejectIssueValidator.ts";
import { ProposalRepository } from "../../infrastructure/repositories/ProposalRepository.ts";
import { ProposalAIAnalysisRepository } from "../../infrastructure/repositories/ProposalAIAnalysisRepository.ts";
import { GeminiProposalAIService } from "../../infrastructure/services/GeminiProposalAIService.ts";
import { GetIssuesWithProposalsUseCase } from "../../application/use-cases/admin/GetIssuesWithProposalsUseCase.ts";
import { GetProposalsForIssueUseCase } from "../../application/use-cases/admin/GetProposalsForIssueUseCase.ts";
import { GetAdminProposalDetailsUseCase } from "../../application/use-cases/admin/GetAdminProposalDetailsUseCase.ts";
import { GetIssueProposalsRecommendationUseCase } from "../../application/use-cases/admin/GetIssueProposalsRecommendationUseCase.ts";
import { GetProposalAISummaryUseCase } from "../../application/use-cases/admin/GetProposalAISummaryUseCase.ts";
import { ProposalSelectionRepository } from "../../infrastructure/repositories/ProposalSelectionRepository.ts";
import { NotificationRepository } from "../../infrastructure/repositories/NotificationRepository.ts";
import { SelectProposalUseCase } from "../../application/use-cases/admin/SelectProposalUseCase.ts";

const router = Router();

const userRepository = new UserRepository();

const categoryRepository = new CategoryRepository();

const issueRepository = new IssueRepository();

const issueAIAnalysisRepository = new IssueAIAnalysisRepository();

const geminiIssueAIService = new GeminiIssueAIService();

const storageService = new S3StorageService();

const getReviewEligibleIssuesUseCase = new GetReviewEligibleIssuesUseCase(
  issueRepository,
  storageService,
);
const approveIssueUseCase = new ApproveIssueUseCase(
  issueRepository,
  storageService,
);
const rejectIssueUseCase = new RejectIssueUseCase(
  issueRepository,
  storageService,
);

const analyzeIssueCommentsUseCase = new AnalyzeIssueCommentsUseCase(
  issueRepository,
  issueAIAnalysisRepository,
  geminiIssueAIService,
);

const getIssueAIAnalysisUseCase = new GetIssueAIAnalysisUseCase(
  issueRepository,
  issueAIAnalysisRepository,
  analyzeIssueCommentsUseCase,
);

const getProviderApplicationsUseCase = new GetProviderApplicationsUseCase(
  userRepository,
);

const getProviderApplicationDetailsUseCase =
  new GetProviderApplicationDetailsUseCase(userRepository, storageService);

const approveProviderApplicationUseCase = new ApproveProviderApplicationUseCase(
  userRepository,
);

const rejectProviderApplicationUseCase = new RejectProviderApplicationUseCase(
  userRepository,
);

const getServiceProvidersUseCase = new GetServiceProvidersUseCase(
  userRepository,
);

const getServiceProviderDetailsUseCase = new GetServiceProviderDetailsUseCase(
  userRepository,
  storageService,
);

const updateServiceProviderStatusUseCase =
  new UpdateServiceProviderStatusUseCase(userRepository);

const getUsersForManagementUseCase = new GetUsersForManagementUseCase(
  userRepository,
);

const updateUserAccountStatusUseCase = new UpdateUserAccountStatusUseCase(
  userRepository,
);

const createCategoryUseCase = new CreateCategoryUseCase(categoryRepository);

const getCategoriesUseCase = new GetCategoriesUseCase(categoryRepository);

const updateCategoryUseCase = new UpdateCategoryUseCase(categoryRepository);

const updateCategoryStatusUseCase = new UpdateCategoryStatusUseCase(
  categoryRepository,
);

const proposalRepository = new ProposalRepository();
const proposalAIAnalysisRepository = new ProposalAIAnalysisRepository();
const geminiProposalAIService = new GeminiProposalAIService();

const getIssuesWithProposalsUseCase = new GetIssuesWithProposalsUseCase(
  proposalRepository,
  storageService,
);

const getProposalsForIssueUseCase = new GetProposalsForIssueUseCase(
  issueRepository,
  proposalRepository,
  userRepository,
  storageService,
);

const getAdminProposalDetailsUseCase = new GetAdminProposalDetailsUseCase(
  issueRepository,
  proposalRepository,
  userRepository,
  storageService,
);

const getIssueProposalsRecommendationUseCase =
  new GetIssueProposalsRecommendationUseCase(
    issueRepository,
    proposalRepository,
    userRepository,
    proposalAIAnalysisRepository,
    geminiProposalAIService,
  );

const getProposalAISummaryUseCase = new GetProposalAISummaryUseCase(
  issueRepository,
  proposalRepository,
  userRepository,
  proposalAIAnalysisRepository,
  geminiProposalAIService,
);

const proposalSelectionRepository = new ProposalSelectionRepository();
const notificationRepository = new NotificationRepository();
const selectProposalUseCase = new SelectProposalUseCase(
  proposalSelectionRepository,
  proposalRepository,
  issueRepository,
  notificationRepository,
);

const adminController = new AdminController(
  getProviderApplicationsUseCase,

  getProviderApplicationDetailsUseCase,

  approveProviderApplicationUseCase,

  rejectProviderApplicationUseCase,

  getServiceProvidersUseCase,

  getServiceProviderDetailsUseCase,

  updateServiceProviderStatusUseCase,

  getUsersForManagementUseCase,

  updateUserAccountStatusUseCase,

  createCategoryUseCase,

  getCategoriesUseCase,

  updateCategoryUseCase,

  updateCategoryStatusUseCase,

  getReviewEligibleIssuesUseCase,
  approveIssueUseCase,
  rejectIssueUseCase,
  getIssueAIAnalysisUseCase,
  analyzeIssueCommentsUseCase,
  getIssuesWithProposalsUseCase,
  getProposalsForIssueUseCase,
  getAdminProposalDetailsUseCase,
  getIssueProposalsRecommendationUseCase,
  getProposalAISummaryUseCase,
  selectProposalUseCase,
);

router.get(
  ApiEndpoints.ADMIN.PROVIDER_APPLICATIONS,
  authenticate,
  authorizeRoles(Role.ADMIN),
  searchRateLimit,
  adminController.getProviderApplications,
);

router.get(
  ApiEndpoints.ADMIN.PROVIDER_APPLICATION_DETAILS,
  authenticate,
  authorizeRoles(Role.ADMIN),
  adminController.getProviderApplicationDetails,
);

router.patch(
  ApiEndpoints.ADMIN.APPROVE_PROVIDER_APPLICATION,
  authenticate,
  authorizeRoles(Role.ADMIN),
  adminController.approveProviderApplication,
);

router.patch(
  ApiEndpoints.ADMIN.REJECT_PROVIDER_APPLICATION,
  authenticate,
  authorizeRoles(Role.ADMIN),
  validate(rejectProviderApplicationSchema),
  adminController.rejectProviderApplication,
);

router.get(
  ApiEndpoints.ADMIN.SERVICE_PROVIDERS,
  authenticate,
  authorizeRoles(Role.ADMIN),
  searchRateLimit,
  adminController.getServiceProviders,
);

router.get(
  ApiEndpoints.ADMIN.SERVICE_PROVIDER_DETAILS,
  authenticate,
  authorizeRoles(Role.ADMIN),
  adminController.getServiceProviderDetails,
);

router.patch(
  ApiEndpoints.ADMIN.UPDATE_SERVICE_PROVIDER_STATUS,
  authenticate,
  authorizeRoles(Role.ADMIN),
  validate(updateServiceProviderStatusSchema),
  adminController.updateServiceProviderStatus,
);

router.get(
  ApiEndpoints.ADMIN.USERS,
  authenticate,
  authorizeRoles(Role.ADMIN),
  searchRateLimit,
  adminController.getUsersForManagement,
);

router.patch(
  ApiEndpoints.ADMIN.UPDATE_USER_ACCOUNT_STATUS,
  authenticate,
  authorizeRoles(Role.ADMIN),
  validate(updateUserAccountStatusSchema),
  adminController.updateUserAccountStatus,
);

router.post(
  ApiEndpoints.ADMIN.CATEGORIES,
  authenticate,
  authorizeRoles(Role.ADMIN),
  validate(createCategorySchema),
  adminController.createCategory,
);

router.get(
  ApiEndpoints.ADMIN.CATEGORIES,
  authenticate,
  authorizeRoles(Role.ADMIN),
  searchRateLimit,
  adminController.getCategories,
);

router.patch(
  ApiEndpoints.ADMIN.UPDATE_CATEGORY,
  authenticate,
  authorizeRoles(Role.ADMIN),
  validate(updateCategorySchema),
  adminController.updateCategory,
);

router.patch(
  ApiEndpoints.ADMIN.UPDATE_CATEGORY_STATUS,
  authenticate,
  authorizeRoles(Role.ADMIN),
  validate(updateCategoryStatusSchema),
  adminController.updateCategoryStatus,
);

router.patch(
  ApiEndpoints.ADMIN.BLOCK_CATEGORY,
  authenticate,
  authorizeRoles(Role.ADMIN),
  adminController.blockCategory,
);

router.patch(
  ApiEndpoints.ADMIN.UNBLOCK_CATEGORY,
  authenticate,
  authorizeRoles(Role.ADMIN),
  adminController.unblockCategory,
);

// Review-eligible issues listing (authenticated, admin only, search rate-limited)
router.get(
  ApiEndpoints.ADMIN.ISSUES,
  authenticate,
  authorizeRoles(Role.ADMIN),
  searchRateLimit,
  adminController.getReviewEligibleIssues,
);

// Admin issue review decisions (authenticated, admin only)
router.patch(
  ApiEndpoints.ADMIN.APPROVE_ISSUE,
  authenticate,
  authorizeRoles(Role.ADMIN),
  adminController.approveIssue,
);
router.patch(
  ApiEndpoints.ADMIN.REJECT_ISSUE,
  authenticate,
  authorizeRoles(Role.ADMIN),
  validate(rejectIssueSchema),
  adminController.rejectIssue,
);

// JanAI Community Analysis (authenticated, admin only)
router.get(
  ApiEndpoints.ADMIN.ISSUE_AI_ANALYSIS,
  authenticate,
  authorizeRoles(Role.ADMIN),
  adminController.getIssueAIAnalysis,
);

router.post(
  ApiEndpoints.ADMIN.ANALYZE_ISSUE,
  authenticate,
  authorizeRoles(Role.ADMIN),
  adminController.triggerIssueAIAnalysis,
);

// Multiple Proposals Review (authenticated, admin only)
router.get(
  ApiEndpoints.ADMIN.PROPOSALS,
  authenticate,
  authorizeRoles(Role.ADMIN),
  searchRateLimit,
  adminController.getIssuesWithProposals,
);

router.get(
  ApiEndpoints.ADMIN.ISSUE_PROPOSALS,
  authenticate,
  authorizeRoles(Role.ADMIN),
  adminController.getProposalsForIssue,
);

router.get(
  ApiEndpoints.ADMIN.PROPOSAL_DETAILS,
  authenticate,
  authorizeRoles(Role.ADMIN),
  adminController.getAdminProposalDetails,
);

router.get(
  ApiEndpoints.ADMIN.ISSUE_PROPOSALS_AI_RECOMMENDATION,
  authenticate,
  authorizeRoles(Role.ADMIN),
  adminController.getIssueProposalsRecommendation,
);

router.get(
  ApiEndpoints.ADMIN.PROPOSAL_AI_SUMMARY,
  authenticate,
  authorizeRoles(Role.ADMIN),
  adminController.getProposalAISummary,
);

router.patch(
  ApiEndpoints.ADMIN.SELECT_PROPOSAL,
  authenticate,
  authorizeRoles(Role.ADMIN),
  adminController.selectProposal,
);

export default router;
