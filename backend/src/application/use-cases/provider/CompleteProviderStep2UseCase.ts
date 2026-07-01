import type { ICompleteProviderStep2UseCase } from "../usecase interfaces/ICompleteProviderStep2UseCase.js";

import type { CompleteProviderStep2RequestDto } from "../../dto/provider/CompleteProviderStep2RequestDto.js";

import ApiError from "../../../shared/utils/apiError.js";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

import { AppMessages } from "../../../shared/constants/messages.js";

import { ProviderType } from "../../../domain/enums/ProviderType.js";

import { OnboardingStatus } from "../../../domain/enums/OnboardingStatus.js";

import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";

export class CompleteProviderStep2UseCase implements ICompleteProviderStep2UseCase {

    constructor(

        private userRepository: IUserRepository

    ) { }

    async execute(dto: CompleteProviderStep2RequestDto): Promise<void> {

        const user = await this.userRepository.findById(dto.userId);

        if (!user) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, AppMessages.ERROR.USER_NOT_FOUND)
        }

        if (!user.providerProfile) {

            throw new ApiError(HttpStatusCode.NOT_FOUND, AppMessages.ERROR.PROVIDER_NOT_FOUND);
        }

        const profile = user.providerProfile;

        if (profile.status.onboardingStatus !== OnboardingStatus.STEP_2) {

            throw new ApiError(HttpStatusCode.BAD_REQUEST, AppMessages.ERROR.INVALID_ONBOARDING_STEP);
        }

        if (!dto.identityProof) {

            throw new ApiError(HttpStatusCode.BAD_REQUEST, AppMessages.ERROR.GOVERNMENT_ID_REQUIRED);

        }


        switch (profile.identity.providerType) {

            case ProviderType.INDIVIDUAL:
                break;

            case ProviderType.VOLUNTEER_GROUP:

                if (!dto.volunteerGroupProfile) {

                    throw new ApiError(HttpStatusCode.BAD_REQUEST, AppMessages.ERROR.VOLUNTEER_GROUP_PROFILE_REQUIRED)
                }
                break;

            case ProviderType.NGO:
                if (!dto.organizationProfile) {

                    throw new ApiError(HttpStatusCode.BAD_REQUEST, AppMessages.ERROR.ORGANIZATION_PROFILE_REQUIRED)
                }
                break;

            default:
                throw new ApiError(HttpStatusCode.BAD_REQUEST, AppMessages.ERROR.INVALID_PROVIDER_TYPE)
        }
        profile.identity.providerName = dto.providerName;

        profile.identity.responsiblePersonName = dto.responsiblePersonName;

        profile.identity.address = dto.address;

        profile.identity.phone = dto.phone;

        profile.documents.identityProof = dto.identityProof;

        if (dto.profileImage !== undefined) profile.documents.profileImage = dto.profileImage;

        profile.workPreferences.categoriesWillingToWork = dto.categoriesWillingToWork;

        if (dto.websiteLinks) {

            profile.workPreferences.websiteLinks = dto.websiteLinks;
        }

        if (dto.previousCommunityPhotos !== undefined) profile.documents.previousCommunityPhotos = dto.previousCommunityPhotos;

        if (dto.volunteerGroupProfile !== undefined) profile.volunteerGroupProfile = dto.volunteerGroupProfile;

        if (dto.organizationProfile !== undefined) profile.organizationProfile = dto.organizationProfile;

        profile.status.onboardingStatus = OnboardingStatus.STEP_3;

        await this.userRepository.updateUser(user);
    }
}