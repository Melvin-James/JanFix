import { compareData } from "../../../shared/utils/hashUtil.ts";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.ts";

import { AppMessages } from "../../../shared/constants/messages.ts";

import ApiError from "../../../shared/utils/apiError.ts";

import type { IUserRepository } from "../../../domain/interface/IUserRepository.ts";

import type { IOtpRepository } from "../../../domain/interface/IOtpRepository.ts";

import { OtpPurpose } from "../../../domain/enums/OtpPurpose.ts";

import type { VerifyResetOtpDTO } from "../../dto/auth/VerifyResetOtpDTO.ts";

import type { IVerifyResetOtpUseCase } from "../usecase interfaces/auth/IVerifyResetOtpUseCase.ts";

import type { IJwtService } from "../../../domain/interface/IJwtService.ts";

export class VerifyResetOtpUseCase implements IVerifyResetOtpUseCase {

    constructor(
        private _userRepository: IUserRepository,
        private _otpRepository: IOtpRepository,
        private _jwtService: IJwtService
    ) {}

    async execute(
        dto: VerifyResetOtpDTO
    ): Promise<string> {

        const user = await this._userRepository.findByEmail(
            dto.email
        );

        if(!user) {
            throw new ApiError(
                HttpStatusCode.NOT_FOUND,
                AppMessages.ERROR.USER_NOT_FOUND
            );
        }

        if(user.authProvider === "GOOGLE") {
            throw new ApiError(
                HttpStatusCode.BAD_REQUEST,
                AppMessages.ERROR.GOOGLE_ACCOUNT_USE_GOOGLE_LOGIN
            );
        }

        const storedOtp = await this._otpRepository.getOtp(
            dto.email,
            OtpPurpose.RESET_PASSWORD
        );


        if(!storedOtp) {
            throw new ApiError(
                HttpStatusCode.BAD_REQUEST,
                AppMessages.ERROR.OTP_EXPIRED_OR_NOT_FOUND
            );
        }

        const otp = dto.otp.trim();

        const isOtpValid = await compareData(
            otp,
            storedOtp
        )

        if(!isOtpValid) {
            throw new ApiError(
                HttpStatusCode.BAD_REQUEST,
                AppMessages.ERROR.INVALID_OTP
            )
        }

        await this._otpRepository.deleteOtp(
            dto.email,
            OtpPurpose.RESET_PASSWORD
        );

        const resetToken = this._jwtService.generateResetToken(
            user.id as string
        )

        await this._otpRepository.deleteOtp(
            dto.email,
            OtpPurpose.RESET_PASSWORD
        )

        return resetToken;
    }
}