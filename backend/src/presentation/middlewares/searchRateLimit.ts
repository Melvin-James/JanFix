import rateLimit from "express-rate-limit";

export const searchRateLimit = rateLimit({
    windowMs: 60 * 1000,
    limit: 60,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please try again shortly"
    },
});