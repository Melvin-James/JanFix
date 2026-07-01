import type { Role } from "../enums/Role.js";

export interface IJwtService {

    generateAccessToken(userId: string, roles: Role[]): string;

    generateRefreshToken(userId: string): string;

    verifyAccessToken(token: string): any;

    verifyRefreshToken(token: string): any;
}