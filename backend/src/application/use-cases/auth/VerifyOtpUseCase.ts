import bcrypt from "bcryptjs";

import type { VerifyOtpDTO } from "../../dto/auth/VerifyOtpDTO.js";

import ApiError from "../../../shared/utils/apiError.js";

import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";

export class VerifyOtpUseCase {

    constructor(
        private userRepository: IUserRepository
    ) { }

    async execute(
        dto: VerifyOtpDTO
    ): Promise<void> {

        const user = await this.userRepository.findByEmail(
            dto.email
        );

        if(!user){
            throw new ApiError(404,"User not found");
        }

        if(user.isVerified){
            throw new ApiError(400,"User already verified");
        }

        if(!user.otp || !user.otpExpiresAt){
            throw new ApiError(400,"OTP not found");
        }

        if(user.otpExpiresAt < new Date()){
            throw new ApiError(400,"OTP expired")
        }

        const isOtpValid = await bcrypt.compare(
            dto.otp,
            user.otp
        )

        if(!isOtpValid){
            throw new ApiError(400,"Invalid OTP");
        }

        user.isVerified = true;

        user.otp = null;
        
        user.otpExpiresAt = null;

        await this.userRepository.update(user);
    }
}