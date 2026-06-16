import type { ICompleteProviderStep3UseCase } from "../usecase interfaces/ICompleteProviderStep3UseCase.js";

import type { IServiceProviderRepository } from "../../../domain/interface/IServiceProviderRepository.js";

import ApiError from "../../../shared/utils/apiError.js";

import { AppMessages } from "../../../shared/constants/messages.js";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

import { OnboardingStatus } from "../../../domain/enums/OnboardingStatus.js";

import { VerificationStatus } from "../../../domain/enums/VerificationStatus.js";

export class CompleteProviderStep3UseCase implements ICompleteProviderStep3UseCase {

    constructor(
        private serviceProviderRepository: IServiceProviderRepository
    ) { }

    async execute(userId: string): Promise<void> {

        const provider = await this.serviceProviderRepository.findByUserId(userId);

        if (!provider) {

            throw new ApiError(
                HttpStatusCode.NOT_FOUND,
                AppMessages.ERROR.PROVIDER_NOT_FOUND
            )
        }

        if (provider.onboardingStatus !== OnboardingStatus.STEP_3) {

            throw new ApiError(
                HttpStatusCode.BAD_REQUEST,
                AppMessages.ERROR.PROVIDER_STEP2_NOT_COMPLETED);
        }

        provider.onboardingStatus = OnboardingStatus.COMPLETED;

        provider.verificationStatus = VerificationStatus.PENDING;

        await this.serviceProviderRepository.updateProvider(provider);
    }
}