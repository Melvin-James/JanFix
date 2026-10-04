import ApiError from "../../../shared/utils/apiError.js";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

import { AppMessages } from "../../../shared/constants/messages.js";

import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";

import { UserMapper } from "../../mappers/LoginMapper.js";

import type { AuthUserDTO } from "../../dto/auth/AuthUserDTO.js";

import type { IGetCurrentUserUseCase } from "../usecase interfaces/auth/IGetCurrentUserUseCase.js";

export class GetCurrentUserUseCase implements IGetCurrentUserUseCase {

    constructor(
        private userRepository: IUserRepository
    ) { }

    async execute(userId: string): Promise<AuthUserDTO> {

        const user = await this.userRepository.findById(userId);

        if (!user) {

            throw new ApiError(HttpStatusCode.UNAUTHORIZED, AppMessages.ERROR.USER_NOT_FOUND);

        }


        return UserMapper.toAuthResponse(user);

    }
}