import express from "express";

import { register } from "../controllers/auth/AuthController.js";
import validate from "../middlewares/validate.js";
import { registerSchema } from "../validators/auth/registerValidator.js";

const router = express.Router();

router.post(
    "/register",
    validate(registerSchema),
    register
);

export default router;