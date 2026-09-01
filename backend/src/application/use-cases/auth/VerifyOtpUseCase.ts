import { compareData } from "../../../shared/utils/hashUtil.js";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";
import { AppMessages } from "../../../shared/constants/messages.js";

import type { VerifyOtpDTO } from "../../dto/auth/VerifyOtpDTO.js";

import ApiError from "../../../shared/utils/apiError.js";

import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";

import type { IOtpRepository } from "../../../domain/interface/IOtpRepository.js";
import type { IVerifyOtpUseCase } from "../usecase interfaces/IVerifyOtpUseCase.js";

export class VerifyOtpUseCase implements IVerifyOtpUseCase {

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
            throw new ApiError(HttpStatusCode.NOT_FOUND, AppMessages.ERROR.USER_NOT_FOUND);
        }

        if (user.isVerified) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, AppMessages.ERROR.USER_ALREADY_VERIFIED);
        }

        const storedOtp = await this.otpRepository.getOtp(dto.email);

        if (!storedOtp) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, AppMessages.ERROR.OTP_EXPIRED_OR_NOT_FOUND);
        }

        const isOtpValid = await compareData(
            dto.otp = dto.otp.trim(),
            storedOtp
        )

        if (!isOtpValid) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, AppMessages.ERROR.INVALID_OTP);
        }

        user.isVerified = true;

        await this.otpRepository.deleteOtp(dto.email);

        await this.userRepository.updateUser(user);
    }
}