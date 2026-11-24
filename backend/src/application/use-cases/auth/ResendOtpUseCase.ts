import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.ts";

import { AppMessages } from "../../../shared/constants/messages.ts";

import ApiError from "../../../shared/utils/apiError.ts";

import generateOtp from "../../../shared/utils/generateOtp.ts";

import { hashData } from "../../../shared/utils/hashUtil.ts";

import type { IUserRepository } from "../../../domain/interface/IUserRepository.ts";

import type { IOtpRepository } from "../../../domain/interface/IOtpRepository.ts";

import type { IEmailService } from "../../../domain/interface/IEmailService.ts";

import { OtpPurpose } from "../../../domain/enums/OtpPurpose.ts";

import type { ResendOtpDTO } from "../../dto/auth/ResendOtpDTO.ts";

import type { IResendOtpUseCase } from "../usecase interfaces/auth/IResendOtpUseCase.ts";


export class ResendOtpUseCase implements IResendOtpUseCase {
    constructor(
        private _userRepository: IUserRepository,
        private _otpRepository: IOtpRepository,
        private _emailService: IEmailService,
    ) {}

    async execute(dto: ResendOtpDTO): Promise<void> {
        
        const user = await this._userRepository.findByEmail(dto.email);

        if(!user) {
            throw new ApiError(
                HttpStatusCode.NOT_FOUND,
                AppMessages.ERROR.USER_NOT_FOUND
            )
        }

        if(dto.purpose === OtpPurpose.VERIFY_ACCOUNT) {
            
            if(user.isVerified) {
                throw new ApiError(
                    HttpStatusCode.BAD_REQUEST,
                    AppMessages.ERROR.ACCOUNT_ALREADY_VERIFIED
                );
            }

        }

        if(dto.purpose === OtpPurpose.RESET_PASSWORD) {

            if(user.authProvider === "GOOGLE") {
                throw new ApiError(
                    HttpStatusCode.BAD_REQUEST,
                    AppMessages.ERROR.GOOGLE_ACCOUNT_USE_GOOGLE_LOGIN
                );
            }
        }

        const otp = generateOtp();

        const hashedOtp = await hashData(otp);

        await this._otpRepository.saveOtp(
            user.email,
            hashedOtp,
            dto.purpose
        );

        await this._emailService.sendOtpEmail(
            user.email,
            otp
        )
    }
}
