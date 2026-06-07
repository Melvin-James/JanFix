import express from "express";

import { register, verifyOtp, login } from "../controllers/auth/AuthController.js";

import validate from "../middlewares/validate.js";

import { registerSchema } from "../validators/auth/registerValidator.js";

import { verifyOtpSchema } from "../validators/auth/verifyOtpValidator.js";

import { loginSchema } from "../validators/auth/loginValidator.js";

import { authenticate } from "../middlewares/authMiddleware.js";

import type { AuthRequest } from "../../shared/types/AuthRequest.js";

import { authorizeRoles } from "../middlewares/roleMiddleware.js";

import { Role } from "../../domain/enums/Role.js";

import { refreshToken } from "../controllers/auth/AuthController.js";

import { logout } from "../controllers/auth/AuthController.js";

const router = express.Router();

router.post("/register", validate(registerSchema), register);

router.post("/verify-otp", validate(verifyOtpSchema), verifyOtp);

router.post("/login", validate(loginSchema), login);

router.get("/me", authenticate, (req: AuthRequest, res) => {
    res.status(200).json({ success: true, message: "Protected route accessed", user: req.user, });
}
);

router.get("/admin-test", authenticate, authorizeRoles(Role.ADMIN), (req, res) => {

    res.status(200).json({
        
        success: true,

        message: "Welcome Admin",
    });
}
);

router.post("/refresh-token", refreshToken);

router.post("/logout",logout);

export default router;