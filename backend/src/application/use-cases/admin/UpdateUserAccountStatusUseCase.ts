import { AccountStatus } from "../../../domain/enums/AccountStatus.ts";

import type { IUserRepository } from "../../../domain/interface/IUserRepository.ts";

import type { IUpdateUserAccountStatusUseCase } from "../usecase interfaces/admin/IUpdateUserAccountStatusUseCase.ts";

import type { UpdateUserAccountStatusResponseDTO } from "../../dto/admin/UpdateUserAccountStatusResponseDTO.ts";

import { UpdateUserAccountStatusMapper } from "../../mappers/UpdateUserAccountStatusMapper.ts";

import ApiError from "../../../shared/utils/apiError.ts";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.ts";

import { AppMessages } from "../../../shared/constants/messages.ts";

export class UpdateUserAccountStatusUseCase implements IUpdateUserAccountStatusUseCase {
    constructor(
        private readonly _userRepository: IUserRepository
    ) {}

    async execute(
        userId: string,
        status: AccountStatus
    ): Promise<UpdateUserAccountStatusResponseDTO> {

        const user = await this._userRepository.findById(userId);

        if(!user) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, AppMessages.ERROR.USER_NOT_FOUND);
        }

        user.accountStatus = status;

        await this._userRepository.updateUser(user);

        return UpdateUserAccountStatusMapper.toResponse(user);
    }
}