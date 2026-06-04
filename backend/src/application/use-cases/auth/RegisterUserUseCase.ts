import bcrypt from "bcryptjs";
import type { RegisterUserDTO } from "../../dto/auth/RegisterUserDTO.js";
import type { RegisterResponseDTO } from "../../dto/auth/RegisterResponseDTO.js";
import { UserMapper } from "../../mappers/UserMapper.js";
import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";
import { Role } from "../../../domain/enums/Role.js";
import type { User } from "../../../domain/entities/User.js";
import ApiError from "../../../shared/utils/apiError.js";
import generateOtp from "../../../shared/utils/generateOtp.js";
import type { IEmailService } from "../../../domain/interface/IEmailService.js";

export class RegisterUserUseCase {

    constructor(
        private userRepository: IUserRepository,

        private emailService: IEmailService
    ) { }

    async execute(dto: RegisterUserDTO): Promise<RegisterResponseDTO> {

        const existingUser = await this.userRepository.findByEmail(dto.email);

        if (existingUser) {
            throw new ApiError(409, "User already exists");
        }

        const otp = generateOtp();

        const hashedOtp = await bcrypt.hash(otp, 10);

        const otpExpiresAt = new Date(
            Date.now() + 5 * 60 * 1000
        );

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user: User = {
            name: dto.name,
            email: dto.email,
            password: hashedPassword,
            role: Role.USER,
            isVerified: false,
            otp: hashedOtp,
            otpExpiresAt
        };

        const createdUser = await this.userRepository.create(user);

        await this.emailService.sendOtpEmail(
            createdUser.email,
            otp
        );

        return UserMapper.toRegisterResponse({
            ...createdUser,
            id: (createdUser as any)._id.toString(),
        });
    }
}