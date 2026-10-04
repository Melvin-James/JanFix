import jwt from "jsonwebtoken";

import ApiError from "../../../shared/utils/apiError.js";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

import { AppMessages } from "../../../shared/constants/messages.js";

import type { IJwtService } from "../../../domain/interface/IJwtService.js";

import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";

import { UserMapper } from "../../mappers/LoginMapper.js";

import type { IGetCurrentSessionUseCase, SessionResult } from "../usecase interfaces/auth/IGetCurrentSessionUseCase.js";

/**
 * Session-aware use case for GET /auth/me.
 *
 * Resolution order:
 *  1. Valid access token  → return user
 *  2. Expired access token + valid refresh token → generate new access token, return user + new token
 *  3. Both invalid/missing → throw 401
 *
 * Security: only an expired access token triggers a refresh. A malformed or
 * tampered access token is rejected immediately without falling back to refresh.
 */
export class GetCurrentSessionUseCase implements IGetCurrentSessionUseCase {

    constructor(
        private jwtService: IJwtService,
        private userRepository: IUserRepository
    ) {}

    async execute(
        accessToken: string | undefined,
        refreshToken: string | undefined
    ): Promise<SessionResult> {

        // --- Try access token ---
        if (accessToken) {
            try {
                const decoded = this.jwtService.verifyAccessToken(accessToken);

                const user = await this.userRepository.findById(decoded.userId);

                if (!user) {
                    throw new ApiError(HttpStatusCode.UNAUTHORIZED, AppMessages.ERROR.USER_NOT_FOUND);
                }

                return { user: UserMapper.toAuthResponse(user) };

            } catch (error: unknown) {
                // Only fall through to refresh for TokenExpiredError; reject tampered tokens immediately
                const isExpired =
                    error instanceof jwt.TokenExpiredError;

                if (!isExpired) {
                    // Malformed, tampered, or other JWT error — do NOT attempt refresh
                    // If error is an ApiError (user not found), propagate it
                    if (error instanceof ApiError) {
                        throw error;
                    }
                    // Invalid token signature / structure → 401
                    throw new ApiError(
                        HttpStatusCode.UNAUTHORIZED,
                        AppMessages.ERROR.INVALID_OR_EXPIRED_TOKEN
                    );
                }
                // Expired → fall through to refresh token check below
            }
        }

        // --- Try refresh token ---
        if (!refreshToken) {
            throw new ApiError(HttpStatusCode.UNAUTHORIZED, AppMessages.ERROR.UNAUTHORIZED);
        }

        try {
            const decoded = this.jwtService.verifyRefreshToken(refreshToken);

            const user = await this.userRepository.findById(decoded.userId);

            if (!user) {
                throw new ApiError(HttpStatusCode.UNAUTHORIZED, AppMessages.ERROR.USER_NOT_FOUND);
            }

            const newAccessToken = this.jwtService.generateAccessToken(
                user.id as string,
                user.roles
            );

            return {
                user: UserMapper.toAuthResponse(user),
                newAccessToken,
            };

        } catch (error: unknown) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(
                HttpStatusCode.UNAUTHORIZED,
                AppMessages.ERROR.INVALID_REFRESH_TOKEN
            );
        }
    }
}
