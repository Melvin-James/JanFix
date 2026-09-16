import express from "express";
import { HttpStatusCode } from "../../shared/enums/HttpStatusCode.js";
import { AppMessages } from "../../shared/constants/messages.js";

// Validation and Middleware
import validate from "../middlewares/validate.js";
import { registerSchema } from "../validators/auth/registerValidator.js";
import { verifyOtpSchema } from "../validators/auth/verifyOtpValidator.js";
import { loginSchema } from "../validators/auth/loginValidator.js";
import { forgotPasswordSchema } from "../validators/auth/forgotPasswordValidator.js";
import { resetPasswordSchema } from "../validators/auth/resetPasswordValidator.js";
import { resendOtpSchema } from "../validators/auth/resendOtpValidator.js";
import { verifyResetOtpSchema } from "../validators/auth/verifyResetOtpValidator.js";


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
import { ForgotPasswordUseCase } from "../../application/use-cases/auth/ForgotPasswordUseCase.js";
import { ResetPasswordUseCase } from "../../application/use-cases/auth/ResetPasswordUseCase.js";
import { VerifyResetOtpUseCase } from "../../application/use-cases/auth/VerifyResetOtpUseCase.js";
import { ResendOtpUseCase } from "../../application/use-cases/auth/ResendOtpUseCase.js";

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
const forgotPasswordUseCase = new ForgotPasswordUseCase(userRepository, otpRepository, emailService);
const resetPasswordUseCase = new ResetPasswordUseCase(userRepository, jwtService);
const verifyResetOtpUseCase = new VerifyResetOtpUseCase(userRepository, otpRepository, jwtService);
const resendOtpUseCase = new ResendOtpUseCase(userRepository, otpRepository, emailService);

const authController = new AuthController(
    registerUserUseCase,
    verifyOtpUseCase,
    loginUseCase,
    refreshTokenUseCase,
    googleAuthUseCase,
    forgotPasswordUseCase,
    resetPasswordUseCase,
    verifyResetOtpUseCase,
    resendOtpUseCase,
    googleAuthService,
);

const router = express.Router();

router.post("/register", validate(registerSchema), authController.register);

router.post("/google", authController.googleAuth);

router.post("/forgot-password", validate(forgotPasswordSchema), authController.forgotPassword);

router.post('/verify-reset-otp', validate(verifyResetOtpSchema), authController.verifyResetOtp);

router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);

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

router.post("/resend-otp", validate(resendOtpSchema), authController.resendOtp);

export default router;