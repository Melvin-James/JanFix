import { compareData } from "../../../shared/utils/hashUtil.js";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

import { AppMessages } from "../../../shared/constants/messages.js";

import type { LoginDTO } from "../../dto/auth/LoginDTO.js";

import ApiError from "../../../shared/utils/apiError.js";

import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";

import type { IJwtService } from "../../../domain/interface/IJwtService.js";

import { UserMapper } from "../../mappers/LoginMapper.js";

import type { ILoginUseCase } from "../usecase interfaces/auth/ILoginUseCase.js";

import type { AuthUserDTO } from "../../dto/auth/AuthUserDTO.js";

import { AccountStatus } from "../../../domain/enums/AccountStatus.js";

import type { ApplicationMode } from "../../../shared/types/AccessTokenPayload.js";

import { ApplicationStatus } from "../../../domain/enums/ApplicationStatus.js";

import { ProviderStatus } from "../../../domain/enums/ProviderStatus.js";

export class LoginUseCase implements ILoginUseCase {
    constructor(

        private userRepository: IUserRepository,
        private jwtService: IJwtService
    ) { }
    async execute(dto: LoginDTO): Promise<{ accessToken: string; refreshToken: string; user: AuthUserDTO; }> {
        const user = await this.userRepository.findByEmail(dto.email);

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
            await this.userRepository.updateUser(user);
        }

        const accessToken = this.jwtService.generateAccessToken(user.id as string, user.roles, activeModeToResume);

        const refreshToken = this.jwtService.generateRefreshToken(user.id as string);

        return {
            accessToken,
            refreshToken,
            user: UserMapper.toAuthResponse(user, activeModeToResume),
        };
    }
}