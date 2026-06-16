import type { ICompleteProviderStep2UseCase } from "../usecase interfaces/ICompleteProviderStep2UseCase.js";

import type { IServiceProviderRepository } from "../../../domain/interface/IServiceProviderRepository.js";

import type { CompleteProviderStep2RequestDto } from "../../dto/provider/CompleteProviderStep2RequestDto.js";

import ApiError from "../../../shared/utils/apiError.js";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

import { AppMessages } from "../../../shared/constants/messages.js";

import { ProviderType } from "../../../domain/enums/ProviderType.js";

import { OnboardingStatus } from "../../../domain/enums/OnboardingStatus.js";

export class CompleteProviderStep2UseCase implements ICompleteProviderStep2UseCase {

    constructor(

        private serviceProviderRepository: IServiceProviderRepository

    ) { }

    async execute(dto: CompleteProviderStep2RequestDto): Promise<void> {

        const provider = await this.serviceProviderRepository.findByUserId(dto.userId);

        if (!provider) {
            throw new ApiError(
                HttpStatusCode.NOT_FOUND,
                AppMessages.ERROR.PROVIDER_NOT_FOUND
            )
        }

        if (
            provider.onboardingStatus !==
            OnboardingStatus.STEP_2
        ) {

            throw new ApiError(
                HttpStatusCode.BAD_REQUEST,
                AppMessages.ERROR.INVALID_ONBOARDING_STEP
            );
        }

        if (!dto.governmentId) {

            throw new ApiError(
                HttpStatusCode.BAD_REQUEST,
                AppMessages.ERROR.GOVERNMENT_ID_REQUIRED
            );

        }


        switch (provider.providerType) {

            case ProviderType.INDIVIDUAL:
                break;

            case ProviderType.VOLUNTEER_GROUP:

                if (!dto.volunteerGroupProfile) {
                    throw new ApiError(
                        HttpStatusCode.BAD_REQUEST,
                        AppMessages.ERROR.VOLUNTEER_GROUP_PROFILE_REQUIRED
                    )
                }
                break;

            case ProviderType.NGO:
                if (!dto.organizationProfile) {
                    throw new ApiError(
                        HttpStatusCode.BAD_REQUEST,
                        AppMessages.ERROR.ORGANIZATION_PROFILE_REQUIRED
                    )
                }
                break;

            default:
                throw new ApiError(
                    HttpStatusCode.BAD_REQUEST,
                    AppMessages.ERROR.INVALID_PROVIDER_TYPE
                )
        }
        provider.providerName = dto.providerName;

        provider.responsiblePersonName = dto.responsiblePersonName;

        provider.address = dto.address;

        provider.phone = dto.phone;

        provider.governmentId = dto.governmentId;

        if (dto.profileImage !== undefined) provider.profileImage = dto.profileImage;

        provider.categoriesWillingToWork = dto.categoriesWillingToWork;

        if (dto.websiteLinks !== undefined) provider.websiteLinks = dto.websiteLinks;

        if (dto.previousCommunityPhotos !== undefined) provider.previousCommunityPhotos = dto.previousCommunityPhotos;

        if (dto.volunteerGroupProfile !== undefined) provider.volunteerGroupProfile = dto.volunteerGroupProfile;

        if (dto.organizationProfile !== undefined) provider.organizationProfile = dto.organizationProfile;

        provider.onboardingStatus = OnboardingStatus.STEP_3;

        await this.serviceProviderRepository.updateProvider(provider);
    }
}