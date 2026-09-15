import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

import { AppMessages } from "../../../shared/constants/messages.js";

import ApiError from "../../../shared/utils/apiError.js";

import generateOtp from "../../../shared/utils/generateOtp.js";

import { hashData } from "../../../shared/utils/hashUtil.js";

import type{ IUserRepository } from "../../../domain/interface/IUserRepository.js";

import type { IOtpRepository } from "../../../domain/interface/IOtpRepository.js";

import type { IEmailService } from "../../../domain/interface/IEmailService.js";

import type { ForgotPasswordDTO } from "../../dto/auth/ForgotPasswordDTO.js";

import type { IForgotPasswordUseCase } from "../usecase interfaces/IForgotPasswordUseCase.js";

import { OtpPurpose } from "../../../domain/enums/OtpPurpose.js";

export class ForgotPasswordUseCase implements IForgotPasswordUseCase {
    
    constructor(
        private userRepository: IUserRepository,
        private otpRepository: IOtpRepository,
        private emailService: IEmailService
    ) {}

    async execute(dto: ForgotPasswordDTO): Promise<void> {
        const user = await this.userRepository.findByEmail(dto.email);

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

        await this.otpRepository.saveOtp(
            user.email,
            hashedOtp,
            OtpPurpose.RESET_PASSWORD
        );

        await this.emailService.sendOtpEmail(
            user.email,
            otp
        )
    }
}