import type { ProviderProfile } from "../../../domain/entities/ProviderProfile.js";

import type { IGetProviderProfileUseCase } from "../usecase interfaces/IGetProviderProfileUseCase.js";

import ApiError from "../../../shared/utils/apiError.js";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

import { AppMessages } from "../../../shared/constants/messages.js";

import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";

export class GetProviderProfileUseCase implements IGetProviderProfileUseCase {

    constructor(

        private userRepository: IUserRepository

    ) {}

    async execute(userId: string): Promise<ProviderProfile> {

        const user = await this.userRepository.findById(userId);

        if (!user) {

            throw new ApiError(HttpStatusCode.NOT_FOUND, AppMessages.ERROR.USER_NOT_FOUND);
        }

        if(!user.providerProfile){
            throw new ApiError(HttpStatusCode.NOT_FOUND, AppMessages.ERROR.PROVIDER_NOT_FOUND);
        }

        return user.providerProfile;
    }
}