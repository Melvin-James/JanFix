import type { ISwitchModeUseCase, SwitchModeResult } from "../usecase interfaces/auth/ISwitchModeUseCase.ts";
import type { IUserRepository } from "../../../domain/interface/IUserRepository.ts";
import type { IJwtService } from "../../../domain/interface/IJwtService.ts";
import type { ApplicationMode } from "../../../shared/types/AccessTokenPayload.ts";
import { UserMapper } from "../../mappers/LoginMapper.ts";
import ApiError from "../../../shared/utils/apiError.ts";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.ts";
import { ApplicationStatus } from "../../../domain/enums/ApplicationStatus.ts";
import { ProviderStatus } from "../../../domain/enums/ProviderStatus.ts";
import { AppMessages } from "../../../shared/constants/messages.ts";

export class SwitchModeUseCase implements ISwitchModeUseCase {
    constructor(
        private readonly _userRepository: IUserRepository,
        private readonly _jwtService: IJwtService
    ) {}

    async execute(userId: string, requestedMode: ApplicationMode): Promise<SwitchModeResult> {
        const user = await this._userRepository.findById(userId);

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
                    "Only approved service providers can switch to provider mode."
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
            const updatedUser = await this._userRepository.updateUser(user);

            const accessToken = this._jwtService.generateAccessToken(
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
            const updatedUser = await this._userRepository.updateUser(user);
            // Returning to USER mode is always permitted for authenticated users
            const accessToken = this._jwtService.generateAccessToken(
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
