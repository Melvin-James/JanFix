import { Router } from "express";

import { ServiceProviderRepository } from "../../infrastructure/repositories/ServiceProviderRepository.js";

import { CompleteProviderStep1UseCase } from "../../application/use-cases/provider/CompleteProviderStep1UseCase.js";

import { CompleteProviderStep2UseCase } from "../../application/use-cases/provider/CompleteProviderStep2UseCase.js";

import { CompleteProviderStep3UseCase } from "../../application/use-cases/provider/CompleteProviderStep3UseCase.js";

import { ProviderController } from "../controllers/provider/ProviderController.js";

import { authenticate } from "../middlewares/authMiddleware.js";

import { authorizeRoles } from "../middlewares/roleMiddleware.js";

import validate from "../middlewares/validate.js";

import { step1Schema } from "../validators/provider/step1Validator.js";

import { step2Schema } from "../validators/provider/step2Validator.js";

import { Role } from "../../domain/enums/Role.js";
import { GetProviderProfileUseCase } from "../../application/use-cases/provider/GetProviderProfileUseCase.js";

const serviceProviderRepository = new ServiceProviderRepository();

const completeProviderStep1UseCase = new CompleteProviderStep1UseCase(serviceProviderRepository);

const completeProviderStep2UseCase = new CompleteProviderStep2UseCase(serviceProviderRepository);

const completeProviderStep3UseCase = new CompleteProviderStep3UseCase(serviceProviderRepository);

const getProviderProfileUseCase = new GetProviderProfileUseCase(serviceProviderRepository);

const providerController = new ProviderController(completeProviderStep1UseCase, completeProviderStep2UseCase, completeProviderStep3UseCase, getProviderProfileUseCase);

const router = Router();

router.post("/onboarding/step-1", authenticate, authorizeRoles(Role.SERVICE_PROVIDER),
    validate(step1Schema), providerController.completeStep1);

router.put("/onboarding/step-2", authenticate, authorizeRoles(Role.SERVICE_PROVIDER),
    validate(step2Schema), providerController.completeStep2);

router.post("/onboarding/submit", authenticate, authorizeRoles(Role.SERVICE_PROVIDER), providerController.completeStep3);

router.get("/profile", authenticate, authorizeRoles(Role.SERVICE_PROVIDER), providerController.getProfile);

export default router;