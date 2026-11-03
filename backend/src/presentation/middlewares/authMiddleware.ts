import type { Request, Response, NextFunction } from "express";

import { HttpStatusCode } from "../../shared/enums/HttpStatusCode.js";

import { AppMessages } from "../../shared/constants/messages.js";

import JwtService from "../../infrastructure/services/JwtService.js";

import ApiError from "../../shared/utils/apiError.js";

import asyncHandler from "../../shared/utils/asyncHandler.js";

import type { AccessTokenPayload, ApplicationMode } from "../../shared/types/AccessTokenPayload.js";

import { AccountStatus } from "../../domain/enums/AccountStatus.js";

import { ApplicationStatus } from "../../domain/enums/ApplicationStatus.js";

import { ProviderStatus } from "../../domain/enums/ProviderStatus.js";

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

        const activeMode: ApplicationMode = decoded.activeMode ?? "USER";

        // If the session token claims SERVICE_PROVIDER mode, revalidate authoritative status
        if (activeMode === "SERVICE_PROVIDER") {
            const isApproved = user.providerProfile?.status?.applicationStatus === ApplicationStatus.APPROVED;
            if (!isApproved) {
                throw new ApiError(
                    HttpStatusCode.FORBIDDEN,
                    "Your service provider access is not approved or has been revoked."
                );
            }

            if (user.providerProfile?.status?.providerStatus === ProviderStatus.BLOCKED) {
                throw new ApiError(
                    HttpStatusCode.FORBIDDEN,
                    "Your service provider account has been blocked."
                );
            }
        }

        req.user = {
            userId: decoded.userId,
            roles: decoded.roles,
            activeMode,
        };

        next();
    }
);

export const optionalAuthenticate = asyncHandler(
    async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        const token = req.cookies?.accessToken;

        if (!token) {
            return next();
        }

        try {
            const decoded = jwtService.verifyAccessToken(token) as AccessTokenPayload;
            const user = await userRepository.findById(decoded.userId);

            if (user && user.accountStatus !== AccountStatus.BLOCKED) {
                req.user = {
                    userId: decoded.userId,
                    roles: decoded.roles,
                    activeMode: decoded.activeMode ?? "USER",
                };
            }
        } catch {
            // Optional auth proceeds without setting req.user if token is invalid or expired
        }

        next();
    }
);

export const requireMode = (expectedMode: ApplicationMode) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        if (!req.user) {
            throw new ApiError(HttpStatusCode.UNAUTHORIZED, AppMessages.ERROR.UNAUTHORIZED);
        }

        const currentMode = req.user.activeMode ?? "USER";
        if (currentMode !== expectedMode) {
            throw new ApiError(
                HttpStatusCode.FORBIDDEN,
                `This action requires ${expectedMode === "SERVICE_PROVIDER" ? "Service Provider" : "User"} mode. Current mode is ${currentMode}.`
            );
        }

        next();
    };
};

// export const requireActiveProvider = asyncHandler(
//     async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
//         if (!req.user) {
//             throw new ApiError(HttpStatusCode.UNAUTHORIZED, AppMessages.ERROR.UNAUTHORIZED);
//         }

//         const user = await userRepository.findById(req.user.userId);
//         if (
//             !user ||
//             !user.providerProfile ||
//             user.providerProfile.status.applicationStatus !== ApplicationStatus.APPROVED
//         ) {
//             throw new ApiError(
//                 HttpStatusCode.FORBIDDEN,
//                 "Approved service provider status is required."
//             );
//         }

//         if (user.providerProfile.status.providerStatus !== ProviderStatus.ACTIVE) {
//             throw new ApiError(
//                 HttpStatusCode.FORBIDDEN,
//                 "Service provider account must be activated to access this workspace."
//             );
//         }

//         next();
//     }
// );

