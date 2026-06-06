import bcrypt from "bcryptjs";

import type { VerifyOtpDTO } from "../../dto/auth/VerifyOtpDTO.js";

import ApiError from "../../../shared/utils/apiError.js";

import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";

import type { IOtpRepository } from "../../../domain/interface/IOtpRepository.js";

export class VerifyOtpUseCase {

    constructor(
        private userRepository: IUserRepository,
        private otpRepository: IOtpRepository
    ) { }

    async execute(
        dto: VerifyOtpDTO
    ): Promise<void> {

        const user = await this.userRepository.findByEmail(
            dto.email
        );

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        if (user.isVerified) {
            throw new ApiError(400, "User already verified");
        }

        const storedOtp = await this.otpRepository.getOtp(dto.email);

        if (!storedOtp) {
            throw new ApiError(400, "OTP expired or not found");
        }

        const isOtpValid = await bcrypt.compare(
            dto.otp = dto.otp.trim(),
            storedOtp
        )

        if (!isOtpValid) {
            throw new ApiError(400, "Invalid OTP");
        }

        user.isVerified = true;

        await this.otpRepository.deleteOtp(dto.email);

        await this.userRepository.update(user);
    }
}