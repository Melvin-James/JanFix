import { hashData } from "../../../shared/utils/hashUtil.ts";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.ts";
import { AppMessages } from "../../../shared/constants/messages.ts";
import type { RegisterUserDTO } from "../../dto/auth/RegisterUserDTO.ts";
import type { AuthUserDTO } from "../../dto/auth/AuthUserDTO.ts";
import { RegisterUserMapper } from "../../mappers/RegisterUserMapper.ts";
import type { IUserRepository } from "../../../domain/interface/IUserRepository.ts";
import { Role } from "../../../domain/enums/Role.ts";
import type { User } from "../../../domain/entities/User.ts";
import ApiError from "../../../shared/utils/apiError.ts";
import generateOtp from "../../../shared/utils/generateOtp.ts";
import type { IEmailService } from "../../../domain/interface/IEmailService.ts";
import type { IOtpRepository } from "../../../domain/interface/IOtpRepository.ts";
import type { IRegisterUserUseCase } from "../usecase interfaces/auth/IRegisterUserUseCase.ts";

import { OtpPurpose } from "../../../domain/enums/OtpPurpose.ts";
import { AuthProvider } from "../../../domain/enums/AuthProvider.ts";
import { AccountStatus } from "../../../domain/enums/AccountStatus.ts";

export class RegisterUserUseCase implements IRegisterUserUseCase {

    constructor(
        private _userRepository: IUserRepository,
        private _otpRepository: IOtpRepository,
        private _emailService: IEmailService
    ) { }

    async execute(dto: RegisterUserDTO): Promise<AuthUserDTO> {

        const existingUser = await this._userRepository.findByEmail(dto.email);

        if (existingUser && existingUser.isVerified) {
            throw new ApiError(HttpStatusCode.CONFLICT, AppMessages.ERROR.USER_ALREADY_EXISTS);
        }

        const otp = generateOtp();
        const hashedOtp = await hashData(otp);
        const hashedPassword = await hashData(dto.password);

        let targetUser: User;

        if (!existingUser) {
            const user: User = {
                fullName: dto.fullName,
                email: dto.email,
                password: hashedPassword,
                roles: [Role.USER],
                activeMode: "USER",
                isVerified: false,
                authProvider: AuthProvider.LOCAL,
                accountStatus: AccountStatus.ACTIVE,
            };
            targetUser = await this._userRepository.create(user);
        } else {
            // Unverified user retrying registration - update details
            existingUser.fullName = dto.fullName;
            existingUser.password = hashedPassword;
            targetUser = await this._userRepository.updateUser(existingUser);
        }

        await this._otpRepository.saveOtp(targetUser.email, hashedOtp, OtpPurpose.VERIFY_ACCOUNT);

        try {
            await this._emailService.sendOtpEmail(
                targetUser.email,
                otp
            );
        } catch (error) {
            console.error("Failed to send registration OTP email:", error);
            throw new ApiError(
                HttpStatusCode.INTERNAL_SERVER_ERROR,
                "Failed to send verification code email. Please try again."
            );
        }

        return RegisterUserMapper.toResponse(targetUser);
    }
}
