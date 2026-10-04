import type { Role } from "../enums/Role.js";

import type { AccessTokenPayload } from "../../shared/types/AccessTokenPayload.js";

import type { RefreshTokenPayload } from "../../shared/types/RefreshTokenPayload.js";

export interface IJwtService {

    generateAccessToken(userId: string, roles: Role[]): string;

    generateRefreshToken(userId: string): string;

    generateResetToken(userId: string): string;

    verifyAccessToken(token: string): AccessTokenPayload;

    verifyRefreshToken(token: string): RefreshTokenPayload;

    verifyResetToken(token: string): string;
    
}