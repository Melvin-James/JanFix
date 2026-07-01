import type { Response, NextFunction } from "express";

import { HttpStatusCode } from "../../shared/enums/HttpStatusCode.js";

import { AppMessages } from "../../shared/constants/messages.js";

import JwtService from "../../infrastructure/services/JwtService.js";

import ApiError from "../../shared/utils/apiError.js";

import type { AuthRequest } from "../../shared/types/AuthRequest.js";

import asyncHandler from "../../shared/utils/asyncHandler.js";
import type { Role } from "../../domain/enums/Role.js";

const jwtService = new JwtService();

export const authenticate = asyncHandler(

    async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new ApiError(HttpStatusCode.UNAUTHORIZED, AppMessages.ERROR.UNAUTHORIZED);
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            throw new ApiError(HttpStatusCode.UNAUTHORIZED, AppMessages.ERROR.UNAUTHORIZED);
        }

        try {

            const decoded =
                jwtService.verifyAccessToken(
                    token
                ) as {

                    userId: string;

                    roles: Role[];
                };

            req.user = {

                userId: decoded.userId,

                roles: decoded.roles,
            };

            return next();

        } catch {

            throw new ApiError(
                HttpStatusCode.UNAUTHORIZED,
                AppMessages.ERROR.INVALID_OR_EXPIRED_TOKEN
            );
        }

    }
);