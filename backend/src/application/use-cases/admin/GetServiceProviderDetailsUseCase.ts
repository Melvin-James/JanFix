import type { IUserRepository } from "../../../domain/interface/IUserRepository.ts";
import type { IStorageService } from "../../services/IStorageService.ts";
import { AppMessages } from "../../../shared/constants/messages.ts";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.ts";
import ApiError from "../../../shared/utils/apiError.ts";
import type { ServiceProviderDetailsResponseDTO } from "../../dto/admin/ServiceProviderDetailsResponseDTO.ts";
import { ServiceProviderDetailsMapper } from "../../mappers/ServiceProviderDetailsMapper.ts";
import { refreshProviderDocuments } from "../../services/refreshUploadedFileUrls.ts";
import type { IGetServiceProviderDetailsUseCase } from "../usecase interfaces/admin/IGetServiceProviderDetailsUseCase.ts";

export class GetServiceProviderDetailsUseCase
    implements IGetServiceProviderDetailsUseCase
{
    constructor(
        private readonly _userRepository: IUserRepository,
        private readonly _storageService: IStorageService
    ) {}

    async execute(
        userId: string
    ): Promise<ServiceProviderDetailsResponseDTO> {

        const user = await this._userRepository.findById(userId);

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
            this._storageService,
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