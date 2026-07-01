import type { ICompleteProviderStep3UseCase } from "../usecase interfaces/ICompleteProviderStep3UseCase.js";

import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";

import ApiError from "../../../shared/utils/apiError.js";

import { AppMessages } from "../../../shared/constants/messages.js";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

import { OnboardingStatus } from "../../../domain/enums/OnboardingStatus.js";

import { VerificationStatus } from "../../../domain/enums/VerificationStatus.js";

export class CompleteProviderStep3UseCase implements ICompleteProviderStep3UseCase {

    constructor(
        private userRepository: IUserRepository
    ) { }

    async execute(userId: string): Promise<void> {

        const user = await this.userRepository.findById(userId);

        if (!user) {

            throw new ApiError(HttpStatusCode.NOT_FOUND, AppMessages.ERROR.USER_NOT_FOUND)
        }

        if (!user.providerProfile) {

            throw new ApiError(HttpStatusCode.NOT_FOUND, AppMessages.ERROR.PROVIDER_NOT_FOUND);
        }

        const profile = user.providerProfile;

        if (profile.status.onboardingStatus !== OnboardingStatus.STEP_3) {

            throw new ApiError(HttpStatusCode.BAD_REQUEST, AppMessages.ERROR.PROVIDER_STEP2_NOT_COMPLETED);
        }

        profile.status.onboardingStatus = OnboardingStatus.COMPLETED;

        profile.status.verificationStatus = VerificationStatus.PENDING;

        await this.userRepository.updateUser(user);
    }
}