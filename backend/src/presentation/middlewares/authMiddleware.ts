import type { Request, Response, NextFunction } from "express";

import { HttpStatusCode } from "../../shared/enums/HttpStatusCode.js";

import { AppMessages } from "../../shared/constants/messages.js";

import JwtService from "../../infrastructure/services/JwtService.js";

import ApiError from "../../shared/utils/apiError.js";

import asyncHandler from "../../shared/utils/asyncHandler.js";

import type { AccessTokenPayload } from "../../shared/types/AccessTokenPayload.js";

const jwtService = new JwtService();

export const authenticate = asyncHandler(

    async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        
        const token = req.cookies.accessToken;

        if (!token) {
            throw new ApiError(HttpStatusCode.UNAUTHORIZED, AppMessages.ERROR.UNAUTHORIZED);
        }

        try {

            const decoded =
                jwtService.verifyAccessToken(
                    token
                ) as AccessTokenPayload

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