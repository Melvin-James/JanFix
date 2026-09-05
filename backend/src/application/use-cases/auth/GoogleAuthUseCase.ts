import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

import { AppMessages } from "../../../shared/constants/messages.js";

import ApiError from "../../../shared/utils/apiError.js";

import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";

import type { IJwtService } from "../../../domain/interface/IJwtService.js";

import { Role } from "../../../domain/enums/Role.js";

import { UserMapper } from "../../mappers/UserMapper.js";

import type { IGoogleAuthUseCase } from "../usecase interfaces/IGoogleAuthUseCase.js";

import type { GoogleUser } from "../../../domain/interface/IGoogleAuthService.js";

import type { LoginResponseDTO } from "../../dto/auth/LoginResponseDTO.js";

export class GoogleAuthUseCase implements IGoogleAuthUseCase{
    constructor(
        private userRepository: IUserRepository,
        private jwtService: IJwtService
    ){}

    async execute(googleUser: GoogleUser): Promise<{
        accessToken: string;
        refreshToken: string;
        user: LoginResponseDTO["user"];
    }> {
        
        if(!googleUser.emailVerified) {
            throw new ApiError(
                HttpStatusCode.UNAUTHORIZED,
                "Google account email is not verified"
            )
        }

        let user = await this.userRepository.findByEmail(
            googleUser.email
        )

        if(!user) {

            user = await this.userRepository.create({

                fullName: googleUser.fullName,

                email: googleUser.email,

                password: "",

                roles: [Role.USER],

                isVerified: true,

                authProvider: "GOOGLE",

                googleId: googleUser.googleId,

            });
        } else {

            if(user.authProvider === "LOCAL") {
                throw new ApiError(
                    HttpStatusCode.CONFLICT,
                    "An account already exists with this email. Please login using your password"
                );
            }

            if(user.googleId !== googleUser.googleId) {
                throw new ApiError(
                    HttpStatusCode.UNAUTHORIZED,
                    "Google account verification failed"
                )
            }
        }

        const accessToken = this.jwtService.generateAccessToken(
            user.id as string,
            user.roles
        );

        const refreshToken = this.jwtService.generateRefreshToken(
            user.id as string
        );

        return {
            accessToken,

            refreshToken,

            user: UserMapper.toAuthResponse(user) as any,
        };
    }
}