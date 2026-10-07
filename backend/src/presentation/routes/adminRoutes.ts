import { Router } from "express";

import { UserRepository } from "../../infrastructure/repositories/UserRepository.js";

import { GetProviderApplicationsUseCase } from "../../application/use-cases/provider/GetProviderApplicationsUseCase.js";

import { AdminController } from "../controllers/admin/AdminController.js";

import { authenticate } from "../middlewares/authMiddleware.js";

import { authorizeRoles } from "../middlewares/roleMiddleware.js";

import { Role } from "../../domain/enums/Role.js";

import { GetProviderApplicationDetailsUseCase } from "../../application/use-cases/provider/GetProviderApplicationDetailsUseCase.js";

import { ApproveProviderApplicationUseCase } from "../../application/use-cases/admin/ApproveProviderApplicationUseCase.js";

import { RejectProviderApplicationUseCase } from "../../application/use-cases/admin/RejectProviderApplicationUseCase.js";

import { GetServiceProvidersUseCase } from "../../application/use-cases/admin/GetServiceProvidersUseCase.js";

import { GetServiceProviderDetailsUseCase } from "../../application/use-cases/admin/GetServiceProviderDetailsUseCase.js";

import { UpdateServiceProviderStatusUseCase } from "../../application/use-cases/admin/UpdateServiceProviderStatusUseCase.js";

import validate from "../middlewares/validate.js";

import { rejectProviderApplicationSchema } from "../validators/admin/rejectProviderApplicationValidator.js";

import { updateServiceProviderStatusSchema } from "../validators/admin/UpdateServiceProviderStatusValidator.js";

import { updateUserAccountStatusSchema } from "../validators/admin/updateUserAccountStatusValidator.js";

import { GetUsersForManagementUseCase } from "../../application/use-cases/admin/GetUsersForManagementUseCase.js";

import { UpdateUserAccountStatusUseCase } from "../../application/use-cases/admin/UpdateUserAccountStatusUseCase.js";

import { CreateCategoryUseCase } from "../../application/use-cases/category/CreateCategoryUseCase.js";

import { CategoryRepository } from "../../infrastructure/repositories/CategoryRepository.js";

import { createCategorySchema, updateCategorySchema, updateCategoryStatusSchema } from "../validators/category/categoryValidator.js";

import { GetCategoriesUseCase } from "../../application/use-cases/category/GetCategoriesUseCase.js";

import { UpdateCategoryUseCase } from "../../application/use-cases/category/UpdateCategoryUseCase.js";

import { UpdateCategoryStatusUseCase } from "../../application/use-cases/category/UpdateCategoryStatusUseCase.js";

import { ApiEndpoints } from "../../shared/constants/apiEndpoints.js";

const router = Router();

const userRepository = new UserRepository();

const categoryRepository = new CategoryRepository();

const getProviderApplicationsUseCase = new GetProviderApplicationsUseCase(userRepository);

const getProviderApplicationDetailsUseCase = new GetProviderApplicationDetailsUseCase(userRepository);

const approveProviderApplicationUseCase = new ApproveProviderApplicationUseCase(userRepository);

const rejectProviderApplicationUseCase = new RejectProviderApplicationUseCase(userRepository);

const getServiceProvidersUseCase = new GetServiceProvidersUseCase(userRepository);

const getServiceProviderDetailsUseCase = new GetServiceProviderDetailsUseCase(userRepository);

const updateServiceProviderStatusUseCase = new UpdateServiceProviderStatusUseCase(userRepository);

const getUsersForManagementUseCase = new GetUsersForManagementUseCase(userRepository);

const updateUserAccountStatusUseCase = new UpdateUserAccountStatusUseCase(userRepository);

const createCategoryUseCase = new CreateCategoryUseCase(categoryRepository);

const getCategoriesUseCase = new GetCategoriesUseCase(categoryRepository);

const updateCategoryUseCase = new UpdateCategoryUseCase(categoryRepository);

const updateCategoryStatusUseCase = new UpdateCategoryStatusUseCase(categoryRepository);

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
    
);



router.get(ApiEndpoints.ADMIN.PROVIDER_APPLICATIONS, authenticate, authorizeRoles(Role.ADMIN), adminController.getProviderApplications);

router.get(ApiEndpoints.ADMIN.PROVIDER_APPLICATION_DETAILS, authenticate, authorizeRoles(Role.ADMIN), adminController.getProviderApplicationDetails);

router.patch(ApiEndpoints.ADMIN.APPROVE_PROVIDER_APPLICATION, authenticate, authorizeRoles(Role.ADMIN), adminController.approveProviderApplication);

router.patch(ApiEndpoints.ADMIN.REJECT_PROVIDER_APPLICATION, authenticate, authorizeRoles(Role.ADMIN), validate(rejectProviderApplicationSchema), adminController.rejectProviderApplication);

router.get(ApiEndpoints.ADMIN.SERVICE_PROVIDERS, authenticate, authorizeRoles(Role.ADMIN), adminController.getServiceProviders);

router.get(ApiEndpoints.ADMIN.SERVICE_PROVIDER_DETAILS, authenticate, authorizeRoles(Role.ADMIN), adminController.getServiceProviderDetails);

router.patch(ApiEndpoints.ADMIN.UPDATE_SERVICE_PROVIDER_STATUS, authenticate, authorizeRoles(Role.ADMIN), validate(updateServiceProviderStatusSchema), adminController.updateServiceProviderStatus);

router.get(ApiEndpoints.ADMIN.USERS, authenticate, authorizeRoles(Role.ADMIN), adminController.getUsersForManagement);

router.patch(ApiEndpoints.ADMIN.UPDATE_USER_ACCOUNT_STATUS, authenticate, authorizeRoles(Role.ADMIN), validate(updateUserAccountStatusSchema), adminController.updateUserAccountStatus);

router.post(ApiEndpoints.ADMIN.CATEGORIES, authenticate, authorizeRoles(Role.ADMIN), validate(createCategorySchema), adminController.createCategory);

router.get(ApiEndpoints.ADMIN.CATEGORIES, authenticate, authorizeRoles(Role.ADMIN), adminController.getCategories);

router.patch(ApiEndpoints.ADMIN.UPDATE_CATEGORY, authenticate, authorizeRoles(Role.ADMIN), validate(updateCategorySchema), adminController.updateCategory);

router.patch(ApiEndpoints.ADMIN.UPDATE_CATEGORY_STATUS, authenticate, authorizeRoles(Role.ADMIN), validate(updateCategoryStatusSchema), adminController.updateCategoryStatus);

router.patch(ApiEndpoints.ADMIN.BLOCK_CATEGORY, authenticate, authorizeRoles(Role.ADMIN), adminController.blockCategory);

router.patch(ApiEndpoints.ADMIN.UNBLOCK_CATEGORY, authenticate, authorizeRoles(Role.ADMIN), adminController.unblockCategory);

export default router;
