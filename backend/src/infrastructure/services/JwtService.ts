import { env } from "../../infrastructure/config/env.js";

import jwt from "jsonwebtoken";

import type { IJwtService } from "../../domain/interface/IJwtService.js";

import type { Role } from "../../domain/enums/Role.js";

class JwtService implements IJwtService {

    generateAccessToken(userId: string, roles: Role[]): string {
        return jwt.sign({ userId, roles, }, env.JWT_ACCESS_SECRET, { expiresIn: "15m", });
    }

    generateRefreshToken(userId: string): string {
        return jwt.sign({ userId, }, env.JWT_REFRESH_SECRET, { expiresIn: "7d", });
    }

    generateResetToken(userId: string): string{
        return jwt.sign({userId}, env.JWT_RESET_SECRET, {expiresIn: "10m"});
    }

    verifyAccessToken(token: string) {
        return jwt.verify(token, env.JWT_ACCESS_SECRET);
    }

    verifyRefreshToken(token: string) {
        return jwt.verify(token, env.JWT_REFRESH_SECRET);
    }

    verifyResetToken(token: string): string {
        const decoded = jwt.verify( token, env.JWT_RESET_SECRET) as {userId: string};

        return decoded.userId;
    }
    
}

export default JwtService;