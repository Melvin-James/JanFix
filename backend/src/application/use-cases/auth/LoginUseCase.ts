import bcrypt from "bcryptjs";

import type { LoginDTO } from "../../dto/auth/LoginDTO.js";

import type { LoginResponseDTO } from "../../dto/auth/LoginResponseDTO.js";

import ApiError from "../../../shared/utils/apiError.js";

import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";

import type { IJwtService } from "../../../domain/interface/IJwtService.js";

export class LoginUseCase {
    constructor(

        private userRepository: IUserRepository,
        private jwtService: IJwtService
    ) { }
    async execute(dto: LoginDTO): Promise<{ accessToken: string; refreshToken: string; user: LoginResponseDTO["user"]; }> {
        const user = await this.userRepository.findByEmail(dto.email);

        if (!user) {
            throw new ApiError(401, "Invalid credentials");
        }

        if (!user.isVerified) {
            throw new ApiError(401, "Please verify your account");
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.password);

        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid credentials");
        }

        const accessToken = this.jwtService.generateAccessToken(user.id as string, user.role);

        const refreshToken = this.jwtService.generateRefreshToken(user.id as string);

        return {

            accessToken,

            refreshToken,

            user: {

                id: user.id as string,

                name: user.name,

                email: user.email,

                role: user.role,

                isVerified: user.isVerified,
            },
        };
    }
}