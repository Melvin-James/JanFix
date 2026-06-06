import type { IOtpRepository } from "../../domain/interface/IOtpRepository.js";
import redisClient from "../config/redis.js";

export class RedisOtpRepository implements IOtpRepository {
    async saveOtp(email: string, otp: string): Promise<void> {
        await redisClient.set(`otp:${email}`, otp, { EX: 300, });
    }
    async getOtp(email: string): Promise<string | null> {
        return await redisClient.get(`otp:${email}`);
    }
    async deleteOtp(email: string): Promise<void> {
        await redisClient.del(`otp:${email}`);
    }
}
