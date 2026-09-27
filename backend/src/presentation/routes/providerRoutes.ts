import { Router } from "express";

import { UserRepository } from "../../infrastructure/repositories/UserRepository.js";

import { ProviderController } from "../controllers/provider/ProviderController.js";

import { SubmitProviderApplicationUseCase } from "../../application/use-cases/provider/SubmitProviderApplicationUseCase.js";

import { ResubmitProviderApplicationUseCase } from "../../application/use-cases/provider/ResubmitProviderApplicationUseCase.js";

import { GetProviderProfileUseCase } from "../../application/use-cases/provider/GetProviderProfileUseCase.js";

import { authenticate } from "../middlewares/authMiddleware.js";

import validate from "../middlewares/validate.js";

import { providerApplicationSchema } from "../validators/provider/providerApplicationSchema.js";

const router = Router();

const userRepository = new UserRepository();

const submitProviderApplicationUseCase = new SubmitProviderApplicationUseCase( userRepository );

const resubmitProviderApplicationUseCase = new ResubmitProviderApplicationUseCase( userRepository );

const getProviderProfileUseCase = new GetProviderProfileUseCase( userRepository );

const providerController = new ProviderController(submitProviderApplicationUseCase, resubmitProviderApplicationUseCase, getProviderProfileUseCase);


// Submit application after review page

router.post("/onboarding/submit", authenticate, validate(providerApplicationSchema), providerController.submit);

// Resubmit application (for rejected providers)

router.post("/onboarding/resubmit", authenticate, validate(providerApplicationSchema), providerController.resubmit);

// Get provider profile after submission / dashboard

router.get("/profile", authenticate, providerController.getProfile);


export default router;