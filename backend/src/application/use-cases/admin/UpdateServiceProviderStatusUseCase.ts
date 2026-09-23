import ApiError from "../../../shared/utils/apiError.js";

import type { ProviderStatus } from "../../../domain/enums/ProviderStatus.js";

import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";

import type { IUpdateServiceProviderStatusUseCase } from "../usecase interfaces/IUpdateServiceProviderStatusUseCase.js";

import type { UpdateServiceProviderStatusResponseDTO } from "../../dto/admin/UpdateServiceProviderStatusResponseDTO.js";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

import { AppMessages } from "../../../shared/constants/messages.js";

import { UpdateServiceProviderStatusMapper } from "../../mappers/UpdateServiceProviderStatusMapper.js";

export class UpdateServiceProviderStatusUseCase implements IUpdateServiceProviderStatusUseCase {
    constructor(private readonly userRepository: IUserRepository) {}

    async execute(
        userId: string,
        status: ProviderStatus
    ): Promise<UpdateServiceProviderStatusResponseDTO> {

        const user = await this.userRepository.findById(userId);

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

        await this.userRepository.updateUser(user);

        return UpdateServiceProviderStatusMapper.toResponse(user);
    }
}