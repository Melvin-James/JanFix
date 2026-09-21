import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";

import type { IGetProviderApplicationDetailsUseCase } from "../usecase interfaces/IGetProviderApplicationDetailsUseCase.js";

import type { ProviderApplicationDetailsResponseDTO } from "../../dto/admin/ProviderApplicationDetailsResponseDTO.js";

import { ProviderApplicationDetailsMapper } from "../../mappers/ProviderApplicationDetailsMapper.js";

import ApiError from "../../../shared/utils/apiError.js";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

import { AppMessages } from "../../../shared/constants/messages.js";

export class GetProviderApplicationDetailsUseCase implements IGetProviderApplicationDetailsUseCase {
    constructor(
        private userRepository: IUserRepository
    ) {}

    async execute(
        userId: string
    ): Promise<ProviderApplicationDetailsResponseDTO> {

        const user = await this.userRepository.findById(userId);

        if(!user) {
            throw new ApiError(
                HttpStatusCode.NOT_FOUND,
                AppMessages.ERROR.USER_NOT_FOUND
            );
        }

        if(!user.providerProfile) {

            throw new ApiError(
                HttpStatusCode.NOT_FOUND,
                AppMessages.ERROR.PROVIDER_NOT_FOUND
            );
        }

        return ProviderApplicationDetailsMapper.toResponse(user);
    }
}