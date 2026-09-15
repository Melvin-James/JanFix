import type { IOtpRepository } from "../../domain/interface/IOtpRepository.js";

import type { OtpPurpose } from "../../domain/enums/OtpPurpose.js";

import redisClient from "../config/redis.js";

export class RedisOtpRepository implements IOtpRepository {

    private getKey(
        email: string,
        purpose: OtpPurpose,
    ): string {
        return `otp:${purpose}:${email}`;
    }

    async saveOtp(email: string, otp: string, purpose: OtpPurpose): Promise<void> {
        await redisClient.set(this.getKey(email, purpose), otp, { EX: 300, });
    }

    async getOtp(email: string, purpose: OtpPurpose): Promise<string | null> {
        return await redisClient.get(this.getKey(email, purpose));
    }

    async deleteOtp(email: string, purpose: OtpPurpose): Promise<void> {
        await redisClient.del(this.getKey(email, purpose));
    }
    
}
