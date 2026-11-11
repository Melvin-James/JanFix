import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

import { AppMessages } from "../../../shared/constants/messages.js";

import ApiError from "../../../shared/utils/apiError.js";

import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";

import type { IJwtService } from "../../../domain/interface/IJwtService.js";

import { Role } from "../../../domain/enums/Role.js";

import { UserMapper } from "../../mappers/LoginMapper.js";

import type { IGoogleAuthUseCase } from "../usecase interfaces/auth/IGoogleAuthUseCase.js";

import type { GoogleUser } from "../../../domain/interface/IGoogleAuthService.js";

import type { AuthUserDTO } from "../../dto/auth/AuthUserDTO.js";

import { AuthProvider } from "../../../domain/enums/AuthProvider.js";

import { AccountStatus } from "../../../domain/enums/AccountStatus.js";

import type { ApplicationMode } from "../../../shared/types/AccessTokenPayload.js";

import { ApplicationStatus } from "../../../domain/enums/ApplicationStatus.js";

import { ProviderStatus } from "../../../domain/enums/ProviderStatus.js";

export class GoogleAuthUseCase implements IGoogleAuthUseCase{
    constructor(
        private userRepository: IUserRepository,
        private jwtService: IJwtService
    ){}

    async execute(googleUser: GoogleUser): Promise<{
        accessToken: string;
        refreshToken: string;
        user: AuthUserDTO;
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

                activeMode: "USER",

                isVerified: true,

                authProvider: AuthProvider.GOOGLE,

                accountStatus: AccountStatus.ACTIVE,

                googleId: googleUser.googleId,

            });
        } else {

            if(user.accountStatus === AccountStatus.BLOCKED) {
                throw new ApiError(
                    HttpStatusCode.FORBIDDEN,
                    AppMessages.ERROR.ACCOUNT_BLOCKED
                )
            }

            if(user.authProvider === AuthProvider.LOCAL) {
                throw new ApiError(
                    HttpStatusCode.CONFLICT,
                    AppMessages.ERROR.GOOGLE_ACCOUNT_USE_GOOGLE_LOGIN
                );
            }

            if(user.googleId !== googleUser.googleId) {
                throw new ApiError(
                    HttpStatusCode.UNAUTHORIZED,
                    AppMessages.ERROR.GOOGLE_EMAIL_NOT_VERIFIED
                )
            }
        }

        const activeModeToResume: ApplicationMode =
            user.activeMode === "SERVICE_PROVIDER" && 
            user.providerProfile?.status.applicationStatus === ApplicationStatus.APPROVED &&
            user.providerProfile?.status.providerStatus !== ProviderStatus.BLOCKED
                ? "SERVICE_PROVIDER"
                : "USER";

        if(user.activeMode !== activeModeToResume) {
            user.activeMode = activeModeToResume;
            await this.userRepository.updateUser(user);
        }

        const accessToken = this.jwtService.generateAccessToken(
            user.id as string,
            user.roles,
            activeModeToResume
        );

        const refreshToken = this.jwtService.generateRefreshToken(
            user.id as string
        );

        return {
            accessToken,

            refreshToken,

            user: UserMapper.toAuthResponse(user, activeModeToResume),
        };
    }
}