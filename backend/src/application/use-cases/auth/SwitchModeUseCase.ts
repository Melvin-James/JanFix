import type { ISwitchModeUseCase, SwitchModeResult } from "../usecase interfaces/auth/ISwitchModeUseCase.js";
import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";
import type { IJwtService } from "../../../domain/interface/IJwtService.js";
import type { ApplicationMode } from "../../../shared/types/AccessTokenPayload.js";
import { UserMapper } from "../../mappers/LoginMapper.js";
import ApiError from "../../../shared/utils/apiError.js";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";
import { ApplicationStatus } from "../../../domain/enums/ApplicationStatus.js";
import { ProviderStatus } from "../../../domain/enums/ProviderStatus.js";
import { AppMessages } from "../../../shared/constants/messages.js";

export class SwitchModeUseCase implements ISwitchModeUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly jwtService: IJwtService
    ) {}

    async execute(userId: string, requestedMode: ApplicationMode): Promise<SwitchModeResult> {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new ApiError(HttpStatusCode.UNAUTHORIZED, AppMessages.ERROR.USER_NOT_FOUND);
        }

        if (requestedMode === "SERVICE_PROVIDER") {
            if (
                !user.providerProfile ||
                user.providerProfile.status.applicationStatus !== ApplicationStatus.APPROVED
            ) {
                throw new ApiError(
                    HttpStatusCode.FORBIDDEN,
                    AppMessages.ERROR.FORBIDDEN
                );
            }

            if (user.providerProfile.status.providerStatus === ProviderStatus.BLOCKED) {
                throw new ApiError(
                    HttpStatusCode.FORBIDDEN,
                    "Your service provider account has been blocked. Please contact support."
                );
            }

            const hasPayoutDetails = Boolean(
                user.providerProfile.payoutDetails?.accountHolderName &&
                user.providerProfile.payoutDetails?.upiId
            );
            const isActivated = user.providerProfile.status.providerStatus === ProviderStatus.ACTIVE && hasPayoutDetails;

            user.activeMode = "SERVICE_PROVIDER";
            const updatedUser = await this.userRepository.updateUser(user);

            const accessToken = this.jwtService.generateAccessToken(
                updatedUser.id as string,
                updatedUser.roles,
                "SERVICE_PROVIDER"
            );

            return {
                activeMode: "SERVICE_PROVIDER",
                accessToken,
                user: UserMapper.toAuthResponse(updatedUser, "SERVICE_PROVIDER"),
                isActivated,
            };
        } else {

            user.activeMode = "USER";
            const updatedUser = await this.userRepository.updateUser(user);
            // Returning to USER mode is always permitted for authenticated users
            const accessToken = this.jwtService.generateAccessToken(
                updatedUser.id as string,
                updatedUser.roles,
                "USER"
            );

            return {
                activeMode: "USER",
                accessToken,
                user: UserMapper.toAuthResponse(updatedUser, "USER"),
            };
        }
    }
}
