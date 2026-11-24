import type { IUserRepository } from "../../../domain/interface/IUserRepository.ts";
import type { IStorageService } from "../../services/IStorageService.ts";
import type { IGetProviderApplicationDetailsUseCase } from "../usecase interfaces/provider/IGetProviderApplicationDetailsUseCase.ts";
import type { ProviderApplicationDetailsResponseDTO } from "../../dto/admin/ProviderApplicationDetailsResponseDTO.ts";
import { ProviderApplicationDetailsMapper } from "../../mappers/ProviderApplicationDetailsMapper.ts";
import { refreshProviderDocuments } from "../../services/refreshUploadedFileUrls.ts";
import ApiError from "../../../shared/utils/apiError.ts";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.ts";
import { AppMessages } from "../../../shared/constants/messages.ts";

export class GetProviderApplicationDetailsUseCase implements IGetProviderApplicationDetailsUseCase {
    constructor(
        private readonly _userRepository: IUserRepository,
        private readonly _storageService: IStorageService
    ) {}

    async execute(
        userId: string
    ): Promise<ProviderApplicationDetailsResponseDTO> {
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

        return ProviderApplicationDetailsMapper.toResponse(userWithRefreshedDocs);
    }
}