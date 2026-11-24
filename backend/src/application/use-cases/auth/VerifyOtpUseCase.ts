import { compareData } from "../../../shared/utils/hashUtil.ts";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.ts";

import { AppMessages } from "../../../shared/constants/messages.ts";

import type { VerifyOtpDTO } from "../../dto/auth/VerifyOtpDTO.ts";

import ApiError from "../../../shared/utils/apiError.ts";

import type { IUserRepository } from "../../../domain/interface/IUserRepository.ts";

import type { IOtpRepository } from "../../../domain/interface/IOtpRepository.ts";

import type { IVerifyOtpUseCase } from "../usecase interfaces/auth/IVerifyOtpUseCase.ts";

import { OtpPurpose } from "../../../domain/enums/OtpPurpose.ts";

export class VerifyOtpUseCase implements IVerifyOtpUseCase {

    constructor(
        private _userRepository: IUserRepository,
        private _otpRepository: IOtpRepository
    ) { }

    async execute(
        dto: VerifyOtpDTO
    ): Promise<void> {

        const user = await this._userRepository.findByEmail(
            dto.email
        );

        if (!user) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, AppMessages.ERROR.USER_NOT_FOUND);
        }

        if (user.isVerified) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, AppMessages.ERROR.USER_ALREADY_VERIFIED);
        }

        const storedOtp = await this._otpRepository.getOtp(dto.email, OtpPurpose.VERIFY_ACCOUNT);

        if (!storedOtp) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, AppMessages.ERROR.OTP_EXPIRED_OR_NOT_FOUND);
        }

        const otp = dto.otp.trim();

        const isOtpValid = await compareData(
            otp,
            storedOtp
        )

        if (!isOtpValid) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, AppMessages.ERROR.INVALID_OTP);
        }

        user.isVerified = true;

        await this._otpRepository.deleteOtp(dto.email, OtpPurpose.VERIFY_ACCOUNT);

        await this._userRepository.updateUser(user);
    }
}