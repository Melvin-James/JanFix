import type { IOtpRepository } from "../../domain/interface/IOtpRepository.ts";

import type { OtpPurpose } from "../../domain/enums/OtpPurpose.ts";

import redisClient from "../config/redis.ts";

export class RedisOtpRepository implements IOtpRepository {

    private _getKey(
        email: string,
        purpose: OtpPurpose,
    ): string {
        return `otp:${purpose}:${email}`;
    }

    async saveOtp(email: string, otp: string, purpose: OtpPurpose): Promise<void> {
        await redisClient.set(this._getKey(email, purpose), otp, { EX: 300, });
    }

    async getOtp(email: string, purpose: OtpPurpose): Promise<string | null> {
        return await redisClient.get(this._getKey(email, purpose));
    }

    async deleteOtp(email: string, purpose: OtpPurpose): Promise<void> {
        await redisClient.del(this._getKey(email, purpose));
    }
    
}
