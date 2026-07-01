import { Router } from "express";

import { UserRepository } from "../../infrastructure/repositories/UserRepository.js";

import { StartProviderOnboardingUseCase } from "../../application/use-cases/provider/StartProviderOnboardingUseCase.js";

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

import JwtService from "../../infrastructure/services/JwtService.js";

const userRepository = new UserRepository();

const startProviderOnboardingUseCase = new StartProviderOnboardingUseCase(userRepository);

const completeProviderStep2UseCase = new CompleteProviderStep2UseCase(userRepository);

const completeProviderStep3UseCase = new CompleteProviderStep3UseCase(userRepository);

const getProviderProfileUseCase = new GetProviderProfileUseCase(userRepository);

const jwtService = new JwtService();

const providerController = new ProviderController(startProviderOnboardingUseCase, completeProviderStep2UseCase, completeProviderStep3UseCase, getProviderProfileUseCase, jwtService);

const router = Router();

router.post("/onboarding/step-1", authenticate,
    validate(step1Schema), providerController.completeStep1);

router.put("/onboarding/step-2", authenticate, authorizeRoles(Role.SERVICE_PROVIDER),
    validate(step2Schema), providerController.completeStep2);

router.post("/onboarding/submit", authenticate, authorizeRoles(Role.SERVICE_PROVIDER), providerController.completeStep3);

router.get("/profile", authenticate, authorizeRoles(Role.SERVICE_PROVIDER), providerController.getProfile);

export default router;