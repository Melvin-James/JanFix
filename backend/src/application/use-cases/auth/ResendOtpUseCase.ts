import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

import { AppMessages } from "../../../shared/constants/messages.js";

import ApiError from "../../../shared/utils/apiError.js";

import generateOtp from "../../../shared/utils/generateOtp.js";

import { hashData } from "../../../shared/utils/hashUtil.js";

import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";

import type { IOtpRepository } from "../../../domain/interface/IOtpRepository.js";

import type { IEmailService } from "../../../domain/interface/IEmailService.js";

import { OtpPurpose } from "../../../domain/enums/OtpPurpose.js";

import type { ResendOtpDTO } from "../../dto/auth/ResendOtpDTO.js";

import type { IResendOtpUseCase } from "../usecase interfaces/IResendOtpUseCase.js";


export class ResendOtpUseCase implements IResendOtpUseCase {
    constructor(
        private userRepository: IUserRepository,
        private otpRepository: IOtpRepository,
        private emailService: IEmailService,
    ) {}

    async execute(dto: ResendOtpDTO): Promise<void> {
        
        const user = await this.userRepository.findByEmail(dto.email);

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

        await this.otpRepository.saveOtp(
            user.email,
            hashedOtp,
            dto.purpose
        );

        await this.emailService.sendOtpEmail(
            user.email,
            otp
        )
    }
}
