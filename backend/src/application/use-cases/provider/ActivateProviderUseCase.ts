import type { IActivateProviderUseCase } from "../usecase interfaces/provider/IActivateProviderUseCase.js";
import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";
import { UserMapper } from "../../mappers/LoginMapper.js";
import ApiError from "../../../shared/utils/apiError.js";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";
import { ApplicationStatus } from "../../../domain/enums/ApplicationStatus.js";
import { ProviderStatus } from "../../../domain/enums/ProviderStatus.js";
import type { AuthUserDTO } from "../../dto/auth/AuthUserDTO.js";

export class ActivateProviderUseCase implements IActivateProviderUseCase {
    constructor(private readonly userRepository: IUserRepository) {}

    async execute(userId: string): Promise<AuthUserDTO> {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new ApiError(HttpStatusCode.UNAUTHORIZED, "User not found");
        }

        if (
            !user.providerProfile ||
            user.providerProfile.status.applicationStatus !== ApplicationStatus.APPROVED
        ) {
            throw new ApiError(
                HttpStatusCode.FORBIDDEN,
                "Approved service provider status is required to activate your account."
            );
        }

        if (user.providerProfile.status.providerStatus === ProviderStatus.BLOCKED) {
            throw new ApiError(
                HttpStatusCode.FORBIDDEN,
                "Your service provider account has been blocked. Please contact support."
            );
        }

        user.providerProfile.status.providerStatus = ProviderStatus.ACTIVE;
        await this.userRepository.updateUser(user);

        return UserMapper.toAuthResponse(user, "SERVICE_PROVIDER");
    }
}
