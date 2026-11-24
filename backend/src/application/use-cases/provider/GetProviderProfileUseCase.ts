import type { ProviderProfile } from "../../../domain/entities/ProviderProfile.ts";
import type { IGetProviderProfileUseCase } from "../usecase interfaces/provider/IGetProviderProfileUseCase.ts";
import ApiError from "../../../shared/utils/apiError.ts";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.ts";
import { AppMessages } from "../../../shared/constants/messages.ts";
import type { IUserRepository } from "../../../domain/interface/IUserRepository.ts";
import type { IStorageService } from "../../services/IStorageService.ts";
import { refreshProviderDocuments } from "../../services/refreshUploadedFileUrls.ts";
import { Role } from "../../../domain/enums/Role.ts";
import { ApplicationStatus } from "../../../domain/enums/ApplicationStatus.ts";

export class GetProviderProfileUseCase implements IGetProviderProfileUseCase {
    constructor(
        private readonly _userRepository: IUserRepository,
        private readonly _storageService: IStorageService
    ) {}

    async execute(userId: string, requestingUserId?: string): Promise<ProviderProfile> {
        const user = await this._userRepository.findById(userId);

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
            const requester = await this._userRepository.findById(requestingUserId);
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
            this._storageService,
            undefined,
            { includeSensitive }
        );

        // Never expose payout details through general provider profile responses
        const { payoutDetails: _omittedPayout, ...safeProfile } = user.providerProfile;

        return {
            ...safeProfile,
            documents: refreshedDocuments,
        };
    }
}
