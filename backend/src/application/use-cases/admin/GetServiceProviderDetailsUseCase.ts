import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";
import type { IStorageService } from "../../services/IStorageService.js";
import { AppMessages } from "../../../shared/constants/messages.js";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";
import ApiError from "../../../shared/utils/apiError.js";
import type { ServiceProviderDetailsResponseDTO } from "../../dto/admin/ServiceProviderDetailsResponseDTO.js";
import { ServiceProviderDetailsMapper } from "../../mappers/ServiceProviderDetailsMapper.js";
import { refreshProviderDocuments } from "../../services/refreshUploadedFileUrls.js";
import type { IGetServiceProviderDetailsUseCase } from "../usecase interfaces/admin/IGetServiceProviderDetailsUseCase.js";

export class GetServiceProviderDetailsUseCase
    implements IGetServiceProviderDetailsUseCase
{
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly storageService: IStorageService
    ) {}

    async execute(
        userId: string
    ): Promise<ServiceProviderDetailsResponseDTO> {

        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new ApiError(
                HttpStatusCode.NOT_FOUND, 
                AppMessages.ERROR.USER_NOT_FOUND
            );
        }

        if (!user.providerProfile) {
            throw new ApiError(
                HttpStatusCode.NOT_FOUND, 
                AppMessages.ERROR.PROVIDER_NOT_FOUND
            );
        }

        const refreshedDocuments = await refreshProviderDocuments(
            user.providerProfile.documents,
            this.storageService,
            undefined,
            { includeSensitive: true }
        );

        const userWithRefreshedDocs = {
            ...user,
            providerProfile: {
                ...user.providerProfile,
                documents: refreshedDocuments,
            },
        };

        return ServiceProviderDetailsMapper.toResponse(userWithRefreshedDocs);
    }
}