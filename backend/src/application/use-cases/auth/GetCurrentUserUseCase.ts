import ApiError from "../../../shared/utils/apiError.ts";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.ts";

import { AppMessages } from "../../../shared/constants/messages.ts";

import type { IUserRepository } from "../../../domain/interface/IUserRepository.ts";

import { UserMapper } from "../../mappers/LoginMapper.ts";

import type { AuthUserDTO } from "../../dto/auth/AuthUserDTO.ts";

import type { IGetCurrentUserUseCase } from "../usecase interfaces/auth/IGetCurrentUserUseCase.ts";

export class GetCurrentUserUseCase implements IGetCurrentUserUseCase {

    constructor(
        private _userRepository: IUserRepository
    ) { }

    async execute(userId: string): Promise<AuthUserDTO> {

        const user = await this._userRepository.findById(userId);

        if (!user) {

            throw new ApiError(HttpStatusCode.UNAUTHORIZED, AppMessages.ERROR.USER_NOT_FOUND);

        }


        return UserMapper.toAuthResponse(user);

    }
}