import { hashData } from "../../../shared/utils/hashUtil.ts";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.ts";

import { AppMessages } from "../../../shared/constants/messages.ts";

import ApiError from "../../../shared/utils/apiError.ts";

import type { IUserRepository } from "../../../domain/interface/IUserRepository.ts";

import type { IJwtService } from "../../../domain/interface/IJwtService.ts";

import type { ResetPasswordDTO } from "../../dto/auth/ResetPasswordDTO.ts";

import type { IResetPasswordUseCase } from "../usecase interfaces/auth/IResetPasswordUseCase.ts";

export class ResetPasswordUseCase implements IResetPasswordUseCase {

    constructor(

        private _userRepository: IUserRepository,
        private _jwtService: IJwtService,

    ) {}

    async execute(dto: ResetPasswordDTO): Promise<void> {
        
        let userId: string;

        try {

            userId = this._jwtService.verifyResetToken(
                dto.resetToken
            );

        } catch {

            throw new ApiError(
                HttpStatusCode.BAD_REQUEST,
                "Reset token is invalid or expired."
            );

        }

        const user = await this._userRepository.findById(
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

        await this._userRepository.updateUser(user);
    }
}