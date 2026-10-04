import { env } from "../../infrastructure/config/env.js";

import jwt from "jsonwebtoken";

import type { IJwtService } from "../../domain/interface/IJwtService.js";

import type { Role } from "../../domain/enums/Role.js";

import type { AccessTokenPayload } from "../../shared/types/AccessTokenPayload.js";

import type { RefreshTokenPayload } from "../../shared/types/RefreshTokenPayload.js";

class JwtService implements IJwtService {

    generateAccessToken(userId: string, roles: Role[]): string {
        return jwt.sign({ userId, roles, }, env.JWT_ACCESS_SECRET, { expiresIn: "15m", });
    }

    generateRefreshToken(userId: string): string {
        return jwt.sign({ userId, }, env.JWT_REFRESH_SECRET, { expiresIn: "7d", });
    }

    generateResetToken(userId: string): string {
        return jwt.sign({ userId }, env.JWT_RESET_SECRET, { expiresIn: "10m" });
    }

    verifyAccessToken(token: string): AccessTokenPayload {
        return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
    }

    verifyRefreshToken(token: string): RefreshTokenPayload {
        return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
    }

    verifyResetToken(token: string): string {
        const decoded = jwt.verify(token, env.JWT_RESET_SECRET) as { userId: string };

        return decoded.userId;
    }

}

export default JwtService;