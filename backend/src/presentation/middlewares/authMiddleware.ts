import type { Request, Response, NextFunction } from "express";

import { HttpStatusCode } from "../../shared/enums/HttpStatusCode.js";

import { AppMessages } from "../../shared/constants/messages.js";

import JwtService from "../../infrastructure/services/JwtService.js";

import ApiError from "../../shared/utils/apiError.js";

import asyncHandler from "../../shared/utils/asyncHandler.js";

import type { AccessTokenPayload } from "../../shared/types/AccessTokenPayload.js";

import { AccountStatus } from "../../domain/enums/AccountStatus.js";

import { UserRepository } from "../../infrastructure/repositories/UserRepository.js";

const jwtService = new JwtService();

const userRepository = new UserRepository();


export const authenticate = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const token = req.cookies.accessToken;

        if (!token) {
            throw new ApiError(
                HttpStatusCode.UNAUTHORIZED,
                AppMessages.ERROR.UNAUTHORIZED
            );
        }

        let decoded: AccessTokenPayload;

        try {
            decoded = jwtService.verifyAccessToken(token) as AccessTokenPayload;
        } catch {
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");

            throw new ApiError(
                HttpStatusCode.UNAUTHORIZED,
                AppMessages.ERROR.INVALID_OR_EXPIRED_TOKEN
            );
        }

        const user = await userRepository.findById(decoded.userId);

        if (!user) {
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");

            throw new ApiError(
                HttpStatusCode.UNAUTHORIZED,
                AppMessages.ERROR.UNAUTHORIZED
            );
        }

        if (user.accountStatus === AccountStatus.BLOCKED) {
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");

            throw new ApiError(
                HttpStatusCode.FORBIDDEN,
                "Your account has been blocked. Please contact support."
            );
        }

        req.user = {
            userId: decoded.userId,
            roles: decoded.roles,
        };

        next();
    }
);
