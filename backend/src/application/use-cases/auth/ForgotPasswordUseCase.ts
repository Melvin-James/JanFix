import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.ts";

import { AppMessages } from "../../../shared/constants/messages.ts";

import ApiError from "../../../shared/utils/apiError.ts";

import generateOtp from "../../../shared/utils/generateOtp.ts";

import { hashData } from "../../../shared/utils/hashUtil.ts";

import type{ IUserRepository } from "../../../domain/interface/IUserRepository.ts";

import type { IOtpRepository } from "../../../domain/interface/IOtpRepository.ts";

import type { IEmailService } from "../../../domain/interface/IEmailService.ts";

import type { ForgotPasswordDTO } from "../../dto/auth/ForgotPasswordDTO.ts";

import type { IForgotPasswordUseCase } from "../usecase interfaces/auth/IForgotPasswordUseCase.ts";

import { OtpPurpose } from "../../../domain/enums/OtpPurpose.ts";

export class ForgotPasswordUseCase implements IForgotPasswordUseCase {
    
    constructor(
        private _userRepository: IUserRepository,
        private _otpRepository: IOtpRepository,
        private _emailService: IEmailService
    ) {}

    async execute(dto: ForgotPasswordDTO): Promise<void> {
        const user = await this._userRepository.findByEmail(dto.email);

        if(!user) {
            throw new ApiError(
                HttpStatusCode.NOT_FOUND,
                AppMessages.ERROR.USER_NOT_FOUND
            )
        }

        if(user.authProvider === 'GOOGLE') {
            throw new ApiError(
                HttpStatusCode.BAD_REQUEST,
                AppMessages.ERROR.GOOGLE_ACCOUNT_USE_GOOGLE_LOGIN
            )
        }

        const otp = generateOtp();

        const hashedOtp = await hashData(otp);

        await this._otpRepository.saveOtp(
            user.email,
            hashedOtp,
            OtpPurpose.RESET_PASSWORD
        );

        await this._emailService.sendOtpEmail(
            user.email,
            otp
        )
    }
}