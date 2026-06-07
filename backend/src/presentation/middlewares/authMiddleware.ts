import type { Response, NextFunction } from "express";

import JwtService from "../../infrastructure/services/JwtService.js";

import ApiError from "../../shared/utils/apiError.js";

import type { AuthRequest } from "../../shared/types/AuthRequest.js";

import asyncHandler from "../../shared/utils/asyncHandler.js";

const jwtService = new JwtService();

export const authenticate = asyncHandler(

    async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new ApiError(401, "Unauthorized");
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            throw new ApiError(401, "Unauthorized");
        }

        try {

            const decoded =
                jwtService.verifyAccessToken(
                    token
                ) as {

                    userId: string;

                    role: string;
                };

            req.user = {

                userId: decoded.userId,

                role: decoded.role,
            };

            next();

        } catch {

            throw new ApiError(
                401,
                "Invalid or expired token"
            );
        }

        next();
    }
);