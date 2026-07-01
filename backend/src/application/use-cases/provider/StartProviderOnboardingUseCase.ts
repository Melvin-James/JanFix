import type { IStartProviderOnboardingUseCase } from "../usecase interfaces/IStartProviderOnboardingUseCase.js";

import { ProviderType } from "../../../domain/enums/ProviderType.js";

import { VerificationStatus } from "../../../domain/enums/VerificationStatus.js";

import { OnboardingStatus } from "../../../domain/enums/OnboardingStatus.js";

import ApiError from "../../../shared/utils/apiError.js";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

import { AppMessages } from "../../../shared/constants/messages.js";

import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";

import { Role } from "../../../domain/enums/Role.js";

import type { User } from "../../../domain/entities/User.js";


export class StartProviderOnboardingUseCase implements IStartProviderOnboardingUseCase {

    constructor(

        private userRepository: IUserRepository

    ) { }

    async execute(userId: string, providerType: ProviderType): Promise<User> {

        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, AppMessages.ERROR.USER_NOT_FOUND);
        }

        if (user.providerProfile) {
            throw new ApiError(HttpStatusCode.CONFLICT, AppMessages.ERROR.PROVIDER_ALREADY_EXISTS);
        }

        if (!user.roles.includes(Role.SERVICE_PROVIDER)) {

            user.roles.push(Role.SERVICE_PROVIDER);
        }


        user.providerProfile = {

            identity: {

                providerType,
            },

            documents: {},

            workPreferences: {},

            status: {

                onboardingStatus: OnboardingStatus.STEP_2,

                verificationStatus: VerificationStatus.PENDING,
            },
        };

        await this.userRepository.updateUser(user);

        return user;
    }
}