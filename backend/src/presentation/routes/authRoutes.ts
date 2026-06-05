import express from "express";

import { register, verifyOtp } from "../controllers/auth/AuthController.js";

import validate from "../middlewares/validate.js";

import { registerSchema } from "../validators/auth/registerValidator.js";

import { verifyOtpSchema } from "../validators/auth/verifyOtpValidator.js";

const router = express.Router();

router.post("/register", validate(registerSchema), register);

router.post("/verify-otp", validate(verifyOtpSchema), verifyOtp);

export default router;