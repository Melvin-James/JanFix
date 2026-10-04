import { hashData } from "../../../shared/utils/hashUtil.js";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";
import { AppMessages } from "../../../shared/constants/messages.js";
import type { RegisterUserDTO } from "../../dto/auth/RegisterUserDTO.js";
import type { AuthUserDTO } from "../../dto/auth/AuthUserDTO.js";
import { RegisterUserMapper } from "../../mappers/RegisterUserMapper.js";
import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";
import { Role } from "../../../domain/enums/Role.js";
import type { User } from "../../../domain/entities/User.js";
import ApiError from "../../../shared/utils/apiError.js";
import generateOtp from "../../../shared/utils/generateOtp.js";
import type { IEmailService } from "../../../domain/interface/IEmailService.js";
import type { IOtpRepository } from "../../../domain/interface/IOtpRepository.js";
import type { IRegisterUserUseCase } from "../usecase interfaces/auth/IRegisterUserUseCase.js";

import { OtpPurpose } from "../../../domain/enums/OtpPurpose.js";
import { AuthProvider } from "../../../domain/enums/AuthProvider.js";
import { AccountStatus } from "../../../domain/enums/AccountStatus.js";

export class RegisterUserUseCase implements IRegisterUserUseCase {

    constructor(
        private userRepository: IUserRepository,
        private otpRepository: IOtpRepository,
        private emailService: IEmailService
    ) { }

    async execute(dto: RegisterUserDTO): Promise<AuthUserDTO> {

        const existingUser = await this.userRepository.findByEmail(dto.email);

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
                isVerified: false,
                authProvider: AuthProvider.LOCAL,
                accountStatus: AccountStatus.ACTIVE,
            };
            targetUser = await this.userRepository.create(user);
        } else {
            // Unverified user retrying registration - update details
            existingUser.fullName = dto.fullName;
            existingUser.password = hashedPassword;
            targetUser = await this.userRepository.updateUser(existingUser);
        }

        await this.otpRepository.saveOtp(targetUser.email, hashedOtp, OtpPurpose.VERIFY_ACCOUNT);

        try {
            await this.emailService.sendOtpEmail(
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