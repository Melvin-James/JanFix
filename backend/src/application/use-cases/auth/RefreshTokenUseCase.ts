import ApiError from "../../../shared/utils/apiError.ts";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.ts";

import { AppMessages } from "../../../shared/constants/messages.ts";

import type { IJwtService } from "../../../domain/interface/IJwtService.ts";

import type { IUserRepository } from "../../../domain/interface/IUserRepository.ts";

import { UserMapper } from "../../mappers/LoginMapper.ts";

import type { IRefreshTokenUseCase } from "../usecase interfaces/auth/IRefreshTokenUseCase.ts";

import type { AuthUserDTO } from "../../dto/auth/AuthUserDTO.ts";

import type { RefreshTokenPayload } from "../../../shared/types/RefreshTokenPayload.ts";

import type { ApplicationMode } from "../../../shared/types/AccessTokenPayload.ts";

import { ApplicationStatus } from "../../../domain/enums/ApplicationStatus.ts";

import { ProviderStatus } from "../../../domain/enums/ProviderStatus.ts";

export class RefreshTokenUseCase implements IRefreshTokenUseCase {
    constructor(

        private _jwtService: IJwtService,

        private _userRepository: IUserRepository

    ) { }
    async execute(

        refreshToken: string

    ): Promise<{ accessToken: string; user: AuthUserDTO }> {

        let decoded: { userId: string; };

        try {

            decoded =
                this._jwtService.verifyRefreshToken(
                    refreshToken
                ) as RefreshTokenPayload;
    

        } catch {

            throw new ApiError(
                HttpStatusCode.UNAUTHORIZED,
                AppMessages.ERROR.INVALID_REFRESH_TOKEN
            );
        }

        const user = await this._userRepository.findById(decoded.userId);

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
            await this._userRepository.updateUser(user);
        }

        const accessToken = this._jwtService.generateAccessToken(user.id as string, user.roles, activeModeToRestore);

        return { accessToken, user: UserMapper.toAuthResponse(user, activeModeToRestore) };
    }
}