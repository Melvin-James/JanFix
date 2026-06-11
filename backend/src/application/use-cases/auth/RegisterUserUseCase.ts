import { hashData } from "../../../shared/utils/hashUtil.js";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";
import { AppMessages } from "../../../shared/constants/messages.js";
import type { RegisterUserDTO } from "../../dto/auth/RegisterUserDTO.js";
import type { RegisterResponseDTO } from "../../dto/auth/RegisterResponseDTO.js";
import { UserMapper } from "../../mappers/UserMapper.js";
import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";
import { Role } from "../../../domain/enums/Role.js";
import type { User } from "../../../domain/entities/User.js";
import ApiError from "../../../shared/utils/apiError.js";
import generateOtp from "../../../shared/utils/generateOtp.js";
import type { IEmailService } from "../../../domain/interface/IEmailService.js";
import type { IOtpRepository } from "../../../domain/interface/IOtpRepository.js";
import type { IRegisterUserUseCase } from "../usecase interfaces/IRegisterUserUseCase.js";

export class RegisterUserUseCase implements IRegisterUserUseCase {

    constructor(
        private userRepository: IUserRepository,
        private otpRepository: IOtpRepository,
        private emailService: IEmailService
    ) { }

    async execute(dto: RegisterUserDTO): Promise<RegisterResponseDTO> {

        const existingUser = await this.userRepository.findByEmail(dto.email);

        if (existingUser) {
            throw new ApiError(HttpStatusCode.CONFLICT, AppMessages.ERROR.USER_ALREADY_EXISTS);
        }

        const otp = generateOtp();

        const hashedOtp = await hashData(otp);

        const hashedPassword = await hashData(dto.password);

        const user: User = {
            email: dto.email,
            password: hashedPassword,
            role: dto.role,
            isVerified: false,
        };

        const createdUser = await this.userRepository.create(user);

        await this.otpRepository.saveOtp(createdUser.email, hashedOtp);

        await this.emailService.sendOtpEmail(
            createdUser.email,
            otp
        );

        return UserMapper.toAuthResponse(createdUser);
    }
}