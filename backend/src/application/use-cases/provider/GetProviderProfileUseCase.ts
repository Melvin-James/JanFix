import type { ProviderProfile } from "../../../domain/entities/ProviderProfile.js";
import type { IGetProviderProfileUseCase } from "../usecase interfaces/provider/IGetProviderProfileUseCase.js";
import ApiError from "../../../shared/utils/apiError.js";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";
import { AppMessages } from "../../../shared/constants/messages.js";
import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";
import type { IStorageService } from "../../services/IStorageService.js";
import { refreshProviderDocuments } from "../../services/refreshUploadedFileUrls.js";
import { Role } from "../../../domain/enums/Role.js";
import { ApplicationStatus } from "../../../domain/enums/ApplicationStatus.js";

export class GetProviderProfileUseCase implements IGetProviderProfileUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly storageService: IStorageService
    ) {}

    async execute(userId: string, requestingUserId?: string): Promise<ProviderProfile> {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, AppMessages.ERROR.USER_NOT_FOUND);
        }

        if (!user.providerProfile) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, AppMessages.ERROR.PROVIDER_NOT_FOUND);
        }

        // Authorization check: determine if requester is owner, admin, or third party
        const isOwner = !requestingUserId || requestingUserId === userId;
        let isAdmin = false;

        if (requestingUserId && !isOwner) {
            const requester = await this.userRepository.findById(requestingUserId);
            isAdmin = Boolean(requester?.roles?.includes(Role.ADMIN));

            // If not owner and not admin, only approved provider profiles may be viewed
            if (!isAdmin && user.providerProfile.status.applicationStatus !== ApplicationStatus.APPROVED) {
                throw new ApiError(HttpStatusCode.FORBIDDEN, "You do not have permission to view this provider profile");
            }
        }

        // Sensitive documents (identityProof, ngoRegistrationDocument) are only visible to owner and admin
        const includeSensitive = isOwner || isAdmin;

        const refreshedDocuments = await refreshProviderDocuments(
            user.providerProfile.documents,
            this.storageService,
            undefined,
            { includeSensitive }
        );

        return {
            ...user.providerProfile,
            documents: refreshedDocuments,
        };
    }
}