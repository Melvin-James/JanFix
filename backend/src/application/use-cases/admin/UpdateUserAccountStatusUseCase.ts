import { AccountStatus } from "../../../domain/enums/AccountStatus.js";

import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";

import type { IUpdateUserAccountStatusUseCase } from "../usecase interfaces/admin/IUpdateUserAccountStatusUseCase.js";

import type { UpdateUserAccountStatusResponseDTO } from "../../dto/admin/UpdateUserAccountStatusResponseDTO.js";

import { UpdateUserAccountStatusMapper } from "../../mappers/UpdateUserAccountStatusMapper.js";

import ApiError from "../../../shared/utils/apiError.js";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

import { AppMessages } from "../../../shared/constants/messages.js";

export class UpdateUserAccountStatusUseCase implements IUpdateUserAccountStatusUseCase {
    constructor(
        private readonly userRepository: IUserRepository
    ) {}

    async execute(
        userId: string,
        status: AccountStatus
    ): Promise<UpdateUserAccountStatusResponseDTO> {

        const user = await this.userRepository.findById(userId);

        if(!user) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, AppMessages.ERROR.USER_NOT_FOUND);
        }

        user.accountStatus = status;

        await this.userRepository.updateUser(user);

        return UpdateUserAccountStatusMapper.toResponse(user);
    }
}