import express from "express";
import { HttpStatusCode } from "../../shared/enums/HttpStatusCode.ts";
import { AppMessages } from "../../shared/constants/messages.ts";
import { ApiEndpoints } from "../../shared/constants/apiEndpoints.ts";

// Validation and Middleware
import validate from "../middlewares/validate.ts";
import { registerSchema } from "../validators/auth/registerValidator.ts";
import { verifyOtpSchema } from "../validators/auth/verifyOtpValidator.ts";
import { loginSchema } from "../validators/auth/loginValidator.ts";
import { forgotPasswordSchema } from "../validators/auth/forgotPasswordValidator.ts";
import { resetPasswordSchema } from "../validators/auth/resetPasswordValidator.ts";
import { resendOtpSchema } from "../validators/auth/resendOtpValidator.ts";
import { verifyResetOtpSchema } from "../validators/auth/verifyResetOtpValidator.ts";
import { updateProfileSchema } from "../validators/auth/updateProfileValidator.ts";

import { authenticate } from "../middlewares/authMiddleware.ts";
import { authorizeRoles } from "../middlewares/roleMiddleware.ts";
import { Role } from "../../domain/enums/Role.ts";

// Controller, Repositories, Services, UseCases
import { AuthController } from "../controllers/auth/AuthController.ts";
import { UserRepository } from "../../infrastructure/repositories/UserRepository.ts";
import { RedisOtpRepository } from "../../infrastructure/repositories/RedisOtpRepository.ts";
import EmailService from "../../infrastructure/services/EmailService.ts";
import JwtService from "../../infrastructure/services/JwtService.ts";
import { RegisterUserUseCase } from "../../application/use-cases/auth/RegisterUserUseCase.ts";
import { VerifyOtpUseCase } from "../../application/use-cases/auth/VerifyOtpUseCase.ts";
import { LoginUseCase } from "../../application/use-cases/auth/LoginUseCase.ts";
import { RefreshTokenUseCase } from "../../application/use-cases/auth/RefreshTokenUseCase.ts";
import { GoogleAuthUseCase } from "../../application/use-cases/auth/GoogleAuthUseCase.ts";
import GoogleAuthService from "../../infrastructure/services/GoogleAuthService.ts";
import { ForgotPasswordUseCase } from "../../application/use-cases/auth/ForgotPasswordUseCase.ts";
import { ResetPasswordUseCase } from "../../application/use-cases/auth/ResetPasswordUseCase.ts";
import { VerifyResetOtpUseCase } from "../../application/use-cases/auth/VerifyResetOtpUseCase.ts";
import { ResendOtpUseCase } from "../../application/use-cases/auth/ResendOtpUseCase.ts";
import { GetCurrentSessionUseCase } from "../../application/use-cases/auth/GetCurrentSessionUseCase.ts";
import { UpdateUserProfileUseCase } from "../../application/use-cases/auth/UpdateUserProfileUseCase.ts";

// Dependency Injection Setup
import { switchModeSchema } from "../validators/auth/switchModeValidator.ts";
import { SwitchModeUseCase } from "../../application/use-cases/auth/SwitchModeUseCase.ts";

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
// Session-aware use case — handles access token + refresh token fallback internally
const getSessionUseCase = new GetCurrentSessionUseCase(jwtService, userRepository);
const updateUserProfileUseCase = new UpdateUserProfileUseCase(userRepository);
const switchModeUseCase = new SwitchModeUseCase(userRepository, jwtService);

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
    getSessionUseCase,
    updateUserProfileUseCase,
    switchModeUseCase,
);

const router = express.Router();

router.post(ApiEndpoints.AUTH.REGISTER, validate(registerSchema), authController.register);

router.post(ApiEndpoints.AUTH.GOOGLE, authController.googleAuth);

router.post(ApiEndpoints.AUTH.FORGOT_PASSWORD, validate(forgotPasswordSchema), authController.forgotPassword);

router.post(ApiEndpoints.AUTH.VERIFY_RESET_OTP, validate(verifyResetOtpSchema), authController.verifyResetOtp);

router.post(ApiEndpoints.AUTH.RESET_PASSWORD, validate(resetPasswordSchema), authController.resetPassword);

router.post(ApiEndpoints.AUTH.VERIFY_OTP, validate(verifyOtpSchema), authController.verifyOtp);

router.post(ApiEndpoints.AUTH.LOGIN, validate(loginSchema), authController.login);

router.post(ApiEndpoints.AUTH.LOGOUT, authController.logout);

// /auth/me is session-aware — no authenticate middleware, the use case handles token resolution
router.get(ApiEndpoints.AUTH.ME, authController.getCurrentUser);

// Self-service profile update (authenticated user only)
router.patch(ApiEndpoints.AUTH.PROFILE, authenticate, validate(updateProfileSchema), authController.updateProfile);

// Mode switching between USER and SERVICE_PROVIDER (authenticated user only)
router.post(ApiEndpoints.AUTH.SWITCH_MODE, authenticate, validate(switchModeSchema), authController.switchMode);

router.get(ApiEndpoints.AUTH.ADMIN_TEST, authenticate, authorizeRoles(Role.ADMIN), (req, res) => {
    res.status(HttpStatusCode.OK).json({
        success: true,
        message: AppMessages.SUCCESS.WELCOME_ADMIN,
    });
});

router.post(ApiEndpoints.AUTH.REFRESH_TOKEN, authController.refreshToken);

router.post(ApiEndpoints.AUTH.RESEND_OTP, validate(resendOtpSchema), authController.resendOtp);

export default router;