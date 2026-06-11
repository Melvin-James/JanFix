import { compareData } from "../../../shared/utils/hashUtil.js";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";
import { AppMessages } from "../../../shared/constants/messages.js";

import type { LoginDTO } from "../../dto/auth/LoginDTO.js";

import type { LoginResponseDTO } from "../../dto/auth/LoginResponseDTO.js";

import ApiError from "../../../shared/utils/apiError.js";

import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";

import type { IJwtService } from "../../../domain/interface/IJwtService.js";
import { UserMapper } from "../../mappers/UserMapper.js";
import type { ILoginUseCase } from "../usecase interfaces/ILoginUseCase.js";

export class LoginUseCase implements ILoginUseCase {
    constructor(

        private userRepository: IUserRepository,
        private jwtService: IJwtService
    ) { }
    async execute(dto: LoginDTO): Promise<{ accessToken: string; refreshToken: string; user: LoginResponseDTO["user"]; }> {
        const user = await this.userRepository.findByEmail(dto.email);

        if (!user) {
            throw new ApiError(HttpStatusCode.UNAUTHORIZED, AppMessages.ERROR.INVALID_CREDENTIALS);
        }

        if (!user.isVerified) {
            throw new ApiError(HttpStatusCode.UNAUTHORIZED, AppMessages.ERROR.PLEASE_VERIFY_ACCOUNT);
        }

        const isPasswordValid = await compareData(dto.password, user.password);

        if (!isPasswordValid) {
            throw new ApiError(HttpStatusCode.UNAUTHORIZED, AppMessages.ERROR.INVALID_CREDENTIALS);
        }

        const accessToken = this.jwtService.generateAccessToken(user.id as string, user.role);

        const refreshToken = this.jwtService.generateRefreshToken(user.id as string);

        return {
            accessToken,
            refreshToken,
            user: UserMapper.toAuthResponse(user) as any,
        };
    }
}