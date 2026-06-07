import ApiError from "../../../shared/utils/apiError.js";

import type { IJwtService } from "../../../domain/interface/IJwtService.js";

import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";

export class RefreshTokenUseCase {
    constructor(

        private jwtService: IJwtService,

        private userRepository: IUserRepository

    ) { }
    async execute(

        refreshToken: string

    ): Promise<string> {

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
                401,
                "Invalid refresh token"
            );
        }

        const user = await this.userRepository.findById(decoded.userId);

        if (!user) {
            throw new ApiError(401, "User not found");
        }

        const accessToken = this.jwtService.generateAccessToken(user.id as string, user.role);

        return accessToken;
    }
}