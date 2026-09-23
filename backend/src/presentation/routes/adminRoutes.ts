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

const router = Router();

const userRepository = new UserRepository();

const getProviderApplicationsUseCase = new GetProviderApplicationsUseCase(userRepository);

const getProviderApplicationDetailsUseCase = new GetProviderApplicationDetailsUseCase(userRepository);

const approveProviderApplicationUseCase = new ApproveProviderApplicationUseCase(userRepository);

const rejectProviderApplicationUseCase = new RejectProviderApplicationUseCase(userRepository);

const getServiceProvidersUseCase = new GetServiceProvidersUseCase(userRepository);

const getServiceProviderDetailsUseCase = new GetServiceProviderDetailsUseCase(userRepository);

const updateServiceProviderStatusUseCase = new UpdateServiceProviderStatusUseCase(userRepository);

const adminController = new AdminController(

    getProviderApplicationsUseCase,

    getProviderApplicationDetailsUseCase,

    approveProviderApplicationUseCase,

    rejectProviderApplicationUseCase,

    getServiceProvidersUseCase,

    getServiceProviderDetailsUseCase,

    updateServiceProviderStatusUseCase,
);


router.get("/provider-applications", authenticate, authorizeRoles(Role.ADMIN), adminController.getProviderApplications);

router.get("/provider-applications/:userId", authenticate, authorizeRoles(Role.ADMIN), adminController.getProviderApplicationDetails);

router.patch("/provider-applications/:userId/approve", authenticate, authorizeRoles(Role.ADMIN), adminController.approveProviderApplication);

router.patch("/provider-applications/:userId/reject", authenticate, authorizeRoles(Role.ADMIN), validate(rejectProviderApplicationSchema), adminController.rejectProviderApplication);

router.get("/service-providers", authenticate, authorizeRoles(Role.ADMIN), adminController.getServiceProviders);

router.get("/service-providers/:userId", authenticate, authorizeRoles(Role.ADMIN), adminController.getServiceProviderDetails);

router.patch("/service-providers/:userId/status", authenticate, authorizeRoles(Role.ADMIN), validate(updateServiceProviderStatusSchema), adminController.updateServiceProviderStatus);

export default router;