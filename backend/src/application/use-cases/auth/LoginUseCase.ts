import { compareData } from "../../../shared/utils/hashUtil.ts";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.ts";

import { AppMessages } from "../../../shared/constants/messages.ts";

import type { LoginDTO } from "../../dto/auth/LoginDTO.ts";

import ApiError from "../../../shared/utils/apiError.ts";

import type { IUserRepository } from "../../../domain/interface/IUserRepository.ts";

import type { IJwtService } from "../../../domain/interface/IJwtService.ts";

import { UserMapper } from "../../mappers/LoginMapper.ts";

import type { ILoginUseCase } from "../usecase interfaces/auth/ILoginUseCase.ts";

import type { AuthUserDTO } from "../../dto/auth/AuthUserDTO.ts";

import { AccountStatus } from "../../../domain/enums/AccountStatus.ts";

import type { ApplicationMode } from "../../../shared/types/AccessTokenPayload.ts";

import { ApplicationStatus } from "../../../domain/enums/ApplicationStatus.ts";

import { ProviderStatus } from "../../../domain/enums/ProviderStatus.ts";

export class LoginUseCase implements ILoginUseCase {
    constructor(

        private _userRepository: IUserRepository,
        private _jwtService: IJwtService
    ) { }
    async execute(dto: LoginDTO): Promise<{ accessToken: string; refreshToken: string; user: AuthUserDTO; }> {
        const user = await this._userRepository.findByEmail(dto.email);

        if (!user) {
            throw new ApiError(HttpStatusCode.UNAUTHORIZED, AppMessages.ERROR.INVALID_CREDENTIALS);
        }

        if(user.accountStatus === AccountStatus.BLOCKED) {
            throw new ApiError(
                HttpStatusCode.FORBIDDEN,
                AppMessages.ERROR.ACCOUNT_BLOCKED
            )
        }

        if (!user.isVerified) {
            throw new ApiError(HttpStatusCode.UNAUTHORIZED, AppMessages.ERROR.PLEASE_VERIFY_ACCOUNT);
        }

        if (!user.password) {
            if (user.authProvider === "GOOGLE") {
                throw new ApiError(HttpStatusCode.UNAUTHORIZED, AppMessages.ERROR.GOOGLE_ACCOUNT_USE_GOOGLE_LOGIN);
            }
            throw new ApiError(HttpStatusCode.UNAUTHORIZED, AppMessages.ERROR.INVALID_CREDENTIALS);
        }

        const isPasswordValid = await compareData(dto.password, user.password);

        if (!isPasswordValid) {
            throw new ApiError(HttpStatusCode.UNAUTHORIZED, AppMessages.ERROR.INVALID_CREDENTIALS);
        }

        const activeModeToResume: ApplicationMode =
            user.activeMode === "SERVICE_PROVIDER" && 
            user.providerProfile?.status.applicationStatus === ApplicationStatus.APPROVED &&
            user.providerProfile?.status.providerStatus !== ProviderStatus.BLOCKED
                ? "SERVICE_PROVIDER"
                : "USER";

        if (user.activeMode !== activeModeToResume) {
            user.activeMode = activeModeToResume;
            await this._userRepository.updateUser(user);
        }

        const accessToken = this._jwtService.generateAccessToken(user.id as string, user.roles, activeModeToResume);

        const refreshToken = this._jwtService.generateRefreshToken(user.id as string);

        return {
            accessToken,
            refreshToken,
            user: UserMapper.toAuthResponse(user, activeModeToResume),
        };
    }
}