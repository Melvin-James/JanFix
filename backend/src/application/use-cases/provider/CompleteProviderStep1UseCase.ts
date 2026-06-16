import type { ICompleteProviderStep1UseCase } from "../usecase interfaces/ICompleteProviderStep1UseCase.js";

import type { IServiceProviderRepository } from "../../../domain/interface/IServiceProviderRepository.js";

import { ProviderType } from "../../../domain/enums/ProviderType.js";

import { VerificationStatus } from "../../../domain/enums/VerificationStatus.js";

import { OnboardingStatus } from "../../../domain/enums/OnboardingStatus.js";

import ApiError from "../../../shared/utils/apiError.js";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

import { AppMessages } from "../../../shared/constants/messages.js";


export class CompleteProviderStep1UseCase implements ICompleteProviderStep1UseCase {

    constructor(

        private serviceProviderRepository: IServiceProviderRepository

    ) { }

    async execute(userId: string, providerType: ProviderType): Promise<void> {

        const existingProvider = await this.serviceProviderRepository.findByUserId(userId);

        if (existingProvider) {

            throw new ApiError(
                HttpStatusCode.CONFLICT,
                AppMessages.ERROR.PROVIDER_ALREADY_EXISTS
            );
        }

        await this.serviceProviderRepository
            .create({

                userId,

                providerType,

                onboardingStatus: OnboardingStatus.STEP_2,

                verificationStatus: VerificationStatus.PENDING,
            });
    }
}