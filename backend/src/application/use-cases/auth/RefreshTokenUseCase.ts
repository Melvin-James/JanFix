import ApiError from "../../../shared/utils/apiError.js";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

import { AppMessages } from "../../../shared/constants/messages.js";

import type { IJwtService } from "../../../domain/interface/IJwtService.js";

import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";

import type { User } from "../../../domain/entities/User.js";

import { UserMapper } from "../../mappers/UserMapper.js";

import type { IRefreshTokenUseCase } from "../usecase interfaces/IRefreshTokenUseCase.js";

export class RefreshTokenUseCase implements IRefreshTokenUseCase {
    constructor(

        private jwtService: IJwtService,

        private userRepository: IUserRepository

    ) { }
    async execute(

        refreshToken: string

    ): Promise<{ accessToken: string; user: User }> {

        let decoded: { userId: string; };

        try {

            decoded =
                this.jwtService.verifyRefreshToken(
                    refreshToken
                ) as {

                    userId: string;
                };

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

        const accessToken = this.jwtService.generateAccessToken(user.id as string, user.roles);

        return { accessToken, user: UserMapper.toAuthResponse(user) as any };
    }
}