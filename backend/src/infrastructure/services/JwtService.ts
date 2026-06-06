import { env } from "../../infrastructure/config/env.js";
import jwt from "jsonwebtoken";
import type { IJwtService } from "../../domain/interface/IJwtService.js";

class JwtService implements IJwtService {

    generateAccessToken(userId: string, role: string): string {
        return jwt.sign({ userId, role, }, env.JWT_ACCESS_SECRET, { expiresIn: "15m", });
    }

    generateRefreshToken(userId: string): string {
        return jwt.sign({ userId, }, env.JWT_REFRESH_SECRET, { expiresIn: "7d", });
    }

    verifyAccessToken(token: string) {
        return jwt.verify(token, env.JWT_ACCESS_SECRET);
    }

    verifyRefreshToken(token: string) {
        return jwt.verify(token, env.JWT_REFRESH_SECRET);
    }
}

export default JwtService;