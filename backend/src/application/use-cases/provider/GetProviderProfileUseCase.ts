import type { IServiceProviderRepository }
from "../../../domain/interface/IServiceProviderRepository.js";

import type { ServiceProvider }
from "../../../domain/entities/ServiceProvider.js";

import type { IGetProviderProfileUseCase }
from "../usecase interfaces/IGetProviderProfileUseCase.js";

import ApiError
from "../../../shared/utils/apiError.js";

import { HttpStatusCode }
from "../../../shared/enums/HttpStatusCode.js";

import { AppMessages }
from "../../../shared/constants/messages.js";

export class GetProviderProfileUseCase
implements IGetProviderProfileUseCase {

    constructor(

        private serviceProviderRepository:
        IServiceProviderRepository

    ) {}

    async execute(
        userId: string
    ): Promise<ServiceProvider> {

        const provider =

            await this
            .serviceProviderRepository
            .findByUserId(userId);

        if (!provider) {

            throw new ApiError(

                HttpStatusCode.NOT_FOUND,

                AppMessages.ERROR.PROVIDER_NOT_FOUND
            );
        }

        return provider;
    }
}