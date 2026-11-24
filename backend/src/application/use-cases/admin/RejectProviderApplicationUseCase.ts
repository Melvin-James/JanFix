import type { IRejectProviderApplicationUseCase } from "../usecase interfaces/admin/IRejectProviderApplicationUseCase.ts";

import type { IUserRepository } from "../../../domain/interface/IUserRepository.ts";

import { ApplicationStatus } from "../../../domain/enums/ApplicationStatus.ts";

import ApiError from "../../../shared/utils/apiError.ts";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.ts";

import { AppMessages } from "../../../shared/constants/messages.ts";


export class RejectProviderApplicationUseCase implements IRejectProviderApplicationUseCase {
    constructor (
        private readonly _userRepository: IUserRepository
    ) {}

    async execute(userId: string, rejectionReason: string){
        
        const user = await this._userRepository.findById(userId);

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

        return this._userRepository.updateUser(user)
    }
}