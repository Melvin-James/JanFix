import ApiError from "../../../shared/utils/apiError.js";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

import { AppMessages } from "../../../shared/constants/messages.js";

import type { IJwtService } from "../../../domain/interface/IJwtService.js";

import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";

import { UserMapper } from "../../mappers/LoginMapper.js";

import type { IRefreshTokenUseCase } from "../usecase interfaces/auth/IRefreshTokenUseCase.js";

import type { AuthUserDTO } from "../../dto/auth/AuthUserDTO.js";

import type { RefreshTokenPayload } from "../../../shared/types/RefreshTokenPayload.js";

import type { ApplicationMode } from "../../../shared/types/AccessTokenPayload.js";

import { ApplicationStatus } from "../../../domain/enums/ApplicationStatus.js";

import { ProviderStatus } from "../../../domain/enums/ProviderStatus.js";

export class RefreshTokenUseCase implements IRefreshTokenUseCase {
    constructor(

        private jwtService: IJwtService,

        private userRepository: IUserRepository

    ) { }
    async execute(

        refreshToken: string

    ): Promise<{ accessToken: string; user: AuthUserDTO }> {

        let decoded: { userId: string; };

        try {

            decoded =
                this.jwtService.verifyRefreshToken(
                    refreshToken
                ) as RefreshTokenPayload;
    

        } catch {

            throw new ApiError(
                HttpStatusCode.UNAUTHORIZED,
                AppMessages.ERROR.INVALID_REFRESH_TOKEN
            );
        }

        const user = await this.userRepository.findById(decoded.userId);

        if (!user) {
            throw new ApiError(HttpStatusCode.UNAUTHORIZED, AppMessages.ERROR.USER_NOT_FOUND);
        }

        const activeModeToRestore: ApplicationMode = 
            user.activeMode === "SERVICE_PROVIDER" &&
            user.providerProfile?.status.applicationStatus === ApplicationStatus.APPROVED &&
            user.providerProfile?.status.providerStatus !== ProviderStatus.BLOCKED
                ? "SERVICE_PROVIDER"
                : "USER";

        if(user.activeMode !== activeModeToRestore) {
            user.activeMode = activeModeToRestore;
            await this.userRepository.updateUser(user);
        }

        const accessToken = this.jwtService.generateAccessToken(user.id as string, user.roles, activeModeToRestore);

        return { accessToken, user: UserMapper.toAuthResponse(user, activeModeToRestore) };
    }
}