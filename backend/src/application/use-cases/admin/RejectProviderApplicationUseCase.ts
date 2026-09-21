import type { IRejectProviderApplicationUseCase } from "../usecase interfaces/IRejectProviderApplicationUseCase.js";

import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";

import { ApplicationStatus } from "../../../domain/enums/ApplicationStatus.js";

import ApiError from "../../../shared/utils/apiError.js";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

import { AppMessages } from "../../../shared/constants/messages.js";
import type { User } from "../../../domain/entities/User.js";


export class RejectProviderApplicationUseCase implements IRejectProviderApplicationUseCase {
    constructor (
        private readonly userRepository: IUserRepository
    ) {}

    async execute(userId: string, rejectionReason: string){
        
        const user = await this.userRepository.findById(userId);

        if(!user) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, AppMessages.ERROR.USER_NOT_FOUND);
        }

        if(!user.providerProfile) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, AppMessages.ERROR.PROVIDER_APPLICATION_NOT_FOUND);
        }

        if(user.providerProfile.status.applicationStatus === ApplicationStatus.APPROVED) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, AppMessages.ERROR.ALREADY_APPROVED_APPLICATION);
        }

        if(user.providerProfile.status.applicationStatus === ApplicationStatus.REJECTED) {
            throw new ApiError(
                HttpStatusCode.BAD_REQUEST,
                AppMessages.ERROR.ALREADY_REJECTED_APPLICATION
            )
        }

        user.providerProfile.status.applicationStatus = ApplicationStatus.REJECTED;

        user.providerProfile.status.rejectionReason = rejectionReason;

        user.providerProfile.status.reviewedAt = new Date();

        return this.userRepository.updateUser(user)
    }
}