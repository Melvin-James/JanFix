import { compareData, hashData } from "../../../shared/utils/hashUtil.js";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

import { AppMessages } from "../../../shared/constants/messages.js";

import ApiError from "../../../shared/utils/apiError.js";

import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";

import type { IOtpRepository } from "../../../domain/interface/IOtpRepository.js";

import { OtpPurpose } from "../../../domain/enums/OtpPurpose.js";

import type { VerifyResetOtpDTO } from "../../dto/auth/VerifyResetOtpDTO.js";

import type { IVerifyResetOtpUseCase } from "../usecase interfaces/IVerifyResetOtpUseCase.js";

import type { IJwtService } from "../../../domain/interface/IJwtService.js";

export class VerifyResetOtpUseCase implements IVerifyResetOtpUseCase {

    constructor(
        private userRepository: IUserRepository,
        private otpRepository: IOtpRepository,
        private jwtService: IJwtService
    ) {}

    async execute(
        dto: VerifyResetOtpDTO
    ): Promise<string> {

        const user = await this.userRepository.findByEmail(
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

        const storedOtp = await this.otpRepository.getOtp(
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

        await this.otpRepository.deleteOtp(
            dto.email,
            OtpPurpose.RESET_PASSWORD
        );

        const resetToken = this.jwtService.generateResetToken(
            user.id as string
        )

        await this.otpRepository.deleteOtp(
            dto.email,
            OtpPurpose.RESET_PASSWORD
        )

        return resetToken;
    }
}