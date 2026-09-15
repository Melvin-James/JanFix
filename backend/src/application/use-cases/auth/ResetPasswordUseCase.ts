import { hashData } from "../../../shared/utils/hashUtil.js";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

import { AppMessages } from "../../../shared/constants/messages.js";

import ApiError from "../../../shared/utils/apiError.js";

import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";

import type { IJwtService } from "../../../domain/interface/IJwtService.js";

import type { ResetPasswordDTO } from "../../dto/auth/ResetPasswordDTO.js";

import type { IResetPasswordUseCase } from "../usecase interfaces/IResetPasswordUseCase.js";

export class ResetPasswordUseCase implements IResetPasswordUseCase {

    constructor(

        private userRepository: IUserRepository,
        private jwtService: IJwtService,

    ) {}

    async execute(dto: ResetPasswordDTO): Promise<void> {
        
        let userId: string;

        try {

            userId = this.jwtService.verifyResetToken(
                dto.resetToken
            );

        } catch {

            throw new ApiError(
                HttpStatusCode.BAD_REQUEST,
                "Reset token is invalid or expired."
            );

        }

        const user = await this.userRepository.findById(
            userId
        );

        if(!user) {
            throw new ApiError(
                HttpStatusCode.NOT_FOUND,
                AppMessages.ERROR.USER_NOT_FOUND
            );
        }

        if(user.authProvider === "GOOGLE") {
            throw new ApiError(
                HttpStatusCode.BAD_REQUEST,
                AppMessages.ERROR.GOOGLE_ACCOUNT_USE_GOOGLE_LOGIN
            );
        }

        const hashedPassword = await hashData(
            dto.newPassword
        );

        user.password = hashedPassword;

        await this.userRepository.updateUser(user);
    }
}