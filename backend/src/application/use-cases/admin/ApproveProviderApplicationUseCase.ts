import type { IApproveProviderApplicationUseCase } from "../usecase interfaces/IApproveProviderApplicationUseCase.js";

import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";

import { ApplicationStatus } from "../../../domain/enums/ApplicationStatus.js";

import { Role } from "../../../domain/enums/Role.js";

import ApiError from "../../../shared/utils/apiError.js";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

import { AppMessages } from "../../../shared/constants/messages.js";

import { ProviderStatus } from "../../../domain/enums/ProviderStatus.js";


export class ApproveProviderApplicationUseCase implements IApproveProviderApplicationUseCase {
    constructor(
        private readonly userRepository: IUserRepository
    ) { }

    async execute(userId: string) {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, AppMessages.ERROR.USER_NOT_FOUND);
        }

        if (!user.providerProfile) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, AppMessages.ERROR.PROVIDER_APPLICATION_NOT_FOUND)
        }

        if (user.providerProfile.status.applicationStatus === ApplicationStatus.REJECTED) {

            throw new ApiError(HttpStatusCode.BAD_REQUEST, AppMessages.ERROR.ALREADY_REJECTED_APPLICATION)

        }

        if (user.providerProfile.status.applicationStatus === ApplicationStatus.APPROVED) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, AppMessages.ERROR.ALREADY_APPROVED_APPLICATION);
        }

        user.providerProfile.status.applicationStatus = ApplicationStatus.APPROVED;

        user.providerProfile.status.providerStatus = ProviderStatus.ACTIVE;

        user.providerProfile.status.reviewedAt = new Date();

        if (!user.roles.includes(Role.SERVICE_PROVIDER)) {
            user.roles.push(Role.SERVICE_PROVIDER);
        }

        return this.userRepository.updateUser(user);
    }
}