import type { Role } from "../enums/Role.js";

import type { AccessTokenPayload, ApplicationMode } from "../../shared/types/AccessTokenPayload.js";

import type { RefreshTokenPayload } from "../../shared/types/RefreshTokenPayload.js";

export interface IJwtService {

    generateAccessToken(userId: string, roles: Role[], activeMode?: ApplicationMode): string;

    generateRefreshToken(userId: string): string;

    generateResetToken(userId: string): string;

    verifyAccessToken(token: string): AccessTokenPayload;

    verifyRefreshToken(token: string): RefreshTokenPayload;

    verifyResetToken(token: string): string;
    
}
