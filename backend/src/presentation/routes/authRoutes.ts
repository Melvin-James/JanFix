import express from "express";
import { HttpStatusCode } from "../../shared/enums/HttpStatusCode.js";
import { AppMessages } from "../../shared/constants/messages.js";

// Validation and Middleware
import validate from "../middlewares/validate.js";
import { registerSchema } from "../validators/auth/registerValidator.js";
import { verifyOtpSchema } from "../validators/auth/verifyOtpValidator.js";
import { loginSchema } from "../validators/auth/loginValidator.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import type { AuthRequest } from "../../shared/types/AuthRequest.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import { Role } from "../../domain/enums/Role.js";

// Controller, Repositories, Services, UseCases
import { AuthController } from "../controllers/auth/AuthController.js";
import { UserRepository } from "../../infrastructure/repositories/UserRepository.js";
import { RedisOtpRepository } from "../../infrastructure/repositories/RedisOtpRepository.js";
import EmailService from "../../infrastructure/services/EmailService.js";
import JwtService from "../../infrastructure/services/JwtService.js";
import { RegisterUserUseCase } from "../../application/use-cases/auth/RegisterUserUseCase.js";
import { VerifyOtpUseCase } from "../../application/use-cases/auth/VerifyOtpUseCase.js";
import { LoginUseCase } from "../../application/use-cases/auth/LoginUseCase.js";
import { RefreshTokenUseCase } from "../../application/use-cases/auth/RefreshTokenUseCase.js";
import { GoogleAuthUseCase } from "../../application/use-cases/auth/GoogleAuthUseCase.js";
import GoogleAuthService from "../../infrastructure/services/GoogleAuthService.js";

// Dependency Injection Setup
const userRepository = new UserRepository();
const otpRepository = new RedisOtpRepository();
const emailService = new EmailService();
const jwtService = new JwtService();
const googleAuthService = new GoogleAuthService();

const registerUserUseCase = new RegisterUserUseCase(userRepository, otpRepository, emailService);
const verifyOtpUseCase = new VerifyOtpUseCase(userRepository, otpRepository);
const loginUseCase = new LoginUseCase(userRepository, jwtService);
const refreshTokenUseCase = new RefreshTokenUseCase(jwtService, userRepository);
const googleAuthUseCase = new GoogleAuthUseCase(userRepository, jwtService);

const authController = new AuthController(
    registerUserUseCase,
    verifyOtpUseCase,
    loginUseCase,
    refreshTokenUseCase,
    googleAuthUseCase,
    googleAuthService,
);

const router = express.Router();

router.post("/register", validate(registerSchema), authController.register);

router.post("/google", authController.googleAuth);

router.post("/verify-otp", validate(verifyOtpSchema), authController.verifyOtp);

router.post("/login", validate(loginSchema), authController.login);

router.post("/logout", authController.logout);

router.get("/me", authenticate, (req: AuthRequest, res) => {
    res.status(HttpStatusCode.OK).json({ success: true, message: AppMessages.SUCCESS.PROTECTED_ROUTE_ACCESSED, user: req.user, });
});

router.get("/admin-test", authenticate, authorizeRoles(Role.ADMIN), (req, res) => {
    res.status(HttpStatusCode.OK).json({
        success: true,
        message: AppMessages.SUCCESS.WELCOME_ADMIN,
    });
});

router.post("/refresh-token", authController.refreshToken);

export default router;