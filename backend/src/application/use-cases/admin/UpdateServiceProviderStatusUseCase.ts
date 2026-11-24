import ApiError from "../../../shared/utils/apiError.ts";

import type { ProviderStatus } from "../../../domain/enums/ProviderStatus.ts";

import type { IUserRepository } from "../../../domain/interface/IUserRepository.ts";

import type { IUpdateServiceProviderStatusUseCase } from "../usecase interfaces/admin/IUpdateServiceProviderStatusUseCase.ts";

import type { UpdateServiceProviderStatusResponseDTO } from "../../dto/admin/UpdateServiceProviderStatusResponseDTO.ts";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.ts";

import { AppMessages } from "../../../shared/constants/messages.ts";

import { UpdateServiceProviderStatusMapper } from "../../mappers/UpdateServiceProviderStatusMapper.ts";

export class UpdateServiceProviderStatusUseCase implements IUpdateServiceProviderStatusUseCase {
    constructor(private readonly _userRepository: IUserRepository) {}

    async execute(
        userId: string,
        status: ProviderStatus
    ): Promise<UpdateServiceProviderStatusResponseDTO> {

        const user = await this._userRepository.findById(userId);

        if(!user) {
            throw new ApiError(
                HttpStatusCode.NOT_FOUND, AppMessages.ERROR.USER_NOT_FOUND
            );
        }

        if(!user.providerProfile) {
            throw new ApiError(
                HttpStatusCode.NOT_FOUND, AppMessages.ERROR.PROVIDER_NOT_FOUND
            );
        }

        if(user.providerProfile.status.applicationStatus !== "APPROVED") {
            throw new ApiError(
                HttpStatusCode.NOT_FOUND, AppMessages.ERROR.APPLICATION_NOT_APPROVED
            );
        }

        user.providerProfile.status.providerStatus = status;

        await this._userRepository.updateUser(user);

        return UpdateServiceProviderStatusMapper.toResponse(user);
    }
}