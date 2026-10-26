import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";
import type { ICategoryRepository } from "../../../domain/interface/ICategoryRepository.js";
import type { IResubmitProviderApplicationUseCase } from "../usecase interfaces/provider/IResubmitProviderApplicationUseCase.js";
import type { SubmitProviderApplicationDTO } from "../../dto/provider/SubmitProviderApplicationDTO.js";
import ApiError from "../../../shared/utils/apiError.js";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";
import { AppMessages } from "../../../shared/constants/messages.js";
import { ProviderType } from "../../../domain/enums/ProviderType.js";
import { ApplicationStatus } from "../../../domain/enums/ApplicationStatus.js";
import type { User } from "../../../domain/entities/User.js";

export class ResubmitProviderApplicationUseCase
    implements IResubmitProviderApplicationUseCase {

    constructor(
        private userRepository: IUserRepository,
        private categoryRepository: ICategoryRepository
    ) { }


    async execute(

        userId: string,

        dto: SubmitProviderApplicationDTO

    ): Promise<User> {


        const user =
            await this.userRepository.findById(userId);


        if (!user) {

            throw new ApiError(
                HttpStatusCode.NOT_FOUND,
                AppMessages.ERROR.USER_NOT_FOUND
            );
        }


        if (!user.providerProfile) {

            throw new ApiError(
                HttpStatusCode.BAD_REQUEST,
                AppMessages.ERROR.PROVIDER_NOT_FOUND
            );
        }


        if (
            user.providerProfile.status.applicationStatus !==
            ApplicationStatus.REJECTED
        ) {

            throw new ApiError(
                HttpStatusCode.CONFLICT,
                AppMessages.ERROR.RESUBMISSION_NOT_ALLOWED
            );
        }


        if (!dto.identityProof) {

            throw new ApiError(
                HttpStatusCode.BAD_REQUEST,
                AppMessages.ERROR.GOVERNMENT_ID_REQUIRED
            );
        }

        if (!dto.categoriesWillingToWork || !Array.isArray(dto.categoriesWillingToWork) || dto.categoriesWillingToWork.length === 0) {
            throw new ApiError(
                HttpStatusCode.BAD_REQUEST,
                AppMessages.ERROR.CATEGORY_NOT_FOUND
            );
        }

        const resolvedCategoryIds: string[] = [];
        for (const catIdOrName of dto.categoriesWillingToWork) {
            let category = null;
            if (/^[0-9a-fA-F]{24}$/.test(catIdOrName)) {
                category = await this.categoryRepository.findById(catIdOrName);
            }
            if (!category) {
                category = await this.categoryRepository.findByName(catIdOrName);
            }
            if (!category) {
                throw new ApiError(
                    HttpStatusCode.BAD_REQUEST,
                    AppMessages.ERROR.CATEGORY_NOT_FOUND
                );
            }
            if (!category.isActive) {
                throw new ApiError(
                    HttpStatusCode.BAD_REQUEST,
                    AppMessages.ERROR.SELECTED_CATEGORY_INACTIVE
                );
            }
            resolvedCategoryIds.push(category.id as string);
        }


        switch (dto.providerType) {

            case ProviderType.INDIVIDUAL:
                break;

            case ProviderType.VOLUNTEER_GROUP:

                if (!dto.volunteerGroupProfile) {

                    throw new ApiError(
                        HttpStatusCode.BAD_REQUEST,
                        AppMessages.ERROR.VOLUNTEER_GROUP_PROFILE_REQUIRED
                    );
                }

                break;

            case ProviderType.NGO:

                if (!dto.organizationProfile) {

                    throw new ApiError(
                        HttpStatusCode.BAD_REQUEST,
                        AppMessages.ERROR.ORGANIZATION_PROFILE_REQUIRED
                    );
                }

                break;

            default:

                throw new ApiError(
                    HttpStatusCode.BAD_REQUEST,
                    AppMessages.ERROR.INVALID_PROVIDER_TYPE
                );
        }


        user.providerProfile = {

            identity: {

                providerType:
                    dto.providerType,

                providerName:
                    dto.providerName,

                responsiblePersonName:
                    dto.responsiblePersonName,

                address:
                    dto.address,

                phone:
                    dto.phone,
            },


            documents: {

                identityProof:
                    dto.identityProof,

                ...(dto.profileImage && {

                    profileImage:
                        dto.profileImage

                }),


                ...(dto.previousCommunityPhotos && {

                    previousCommunityPhotos:
                        dto.previousCommunityPhotos

                }),


                ...(dto.volunteerGroupProfile?.logo && {

                    logo:
                        dto.volunteerGroupProfile.logo

                }),


                ...(dto.organizationProfile?.logo && {

                    logo:
                        dto.organizationProfile.logo

                }),


                ...(dto.organizationProfile?.ngoRegistrationDocument && {

                    ngoRegistrationDocument:
                        dto.organizationProfile.ngoRegistrationDocument

                }),

            },


            workPreferences: {

                categoriesWillingToWork:
                    resolvedCategoryIds,

                ...(dto.websiteLinks && {

                    websiteLinks:
                        dto.websiteLinks

                }),

            },


            ...(dto.volunteerGroupProfile && {

                volunteerGroupProfile: {

                    memberCount:
                        dto.volunteerGroupProfile.memberCount

                }

            }),


            ...(dto.organizationProfile && {

                organizationProfile: {

                    memberCount:
                        dto.organizationProfile.memberCount

                }

            }),


            status: {

                applicationStatus:
                    ApplicationStatus.UNDER_REVIEW,

                submittedAt:

                    new Date(),

            },
        };


        await this.userRepository.updateUser(user);

        return user;
    }
}
