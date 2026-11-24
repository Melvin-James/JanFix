import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.ts";

import { AppMessages } from "../../../shared/constants/messages.ts";

import ApiError from "../../../shared/utils/apiError.ts";

import type { IUserRepository } from "../../../domain/interface/IUserRepository.ts";

import type { IJwtService } from "../../../domain/interface/IJwtService.ts";

import { Role } from "../../../domain/enums/Role.ts";

import { UserMapper } from "../../mappers/LoginMapper.ts";

import type { IGoogleAuthUseCase } from "../usecase interfaces/auth/IGoogleAuthUseCase.ts";

import type { GoogleUser } from "../../../domain/interface/IGoogleAuthService.ts";

import type { AuthUserDTO } from "../../dto/auth/AuthUserDTO.ts";

import { AuthProvider } from "../../../domain/enums/AuthProvider.ts";

import { AccountStatus } from "../../../domain/enums/AccountStatus.ts";

import type { ApplicationMode } from "../../../shared/types/AccessTokenPayload.ts";

import { ApplicationStatus } from "../../../domain/enums/ApplicationStatus.ts";

import { ProviderStatus } from "../../../domain/enums/ProviderStatus.ts";

export class GoogleAuthUseCase implements IGoogleAuthUseCase{
    constructor(
        private _userRepository: IUserRepository,
        private _jwtService: IJwtService
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

        let user = await this._userRepository.findByEmail(
            googleUser.email
        )

        if(!user) {

            user = await this._userRepository.create({

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
            await this._userRepository.updateUser(user);
        }

        const accessToken = this._jwtService.generateAccessToken(
            user.id as string,
            user.roles,
            activeModeToResume
        );

        const refreshToken = this._jwtService.generateRefreshToken(
            user.id as string
        );

        return {
            accessToken,

            refreshToken,

            user: UserMapper.toAuthResponse(user, activeModeToResume),
        };
    }
}