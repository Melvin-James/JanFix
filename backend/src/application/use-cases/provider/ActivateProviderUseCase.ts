import type { IActivateProviderUseCase } from "../usecase interfaces/provider/IActivateProviderUseCase.js";
import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";
import { UserMapper } from "../../mappers/LoginMapper.js";
import ApiError from "../../../shared/utils/apiError.js";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";
import { ApplicationStatus } from "../../../domain/enums/ApplicationStatus.js";
import { ProviderStatus } from "../../../domain/enums/ProviderStatus.js";
import type { AuthUserDTO } from "../../dto/auth/AuthUserDTO.js";
import type { ActivateProviderDTO } from "../../dto/provider/ActivateProviderDTO.js";

export class ActivateProviderUseCase implements IActivateProviderUseCase {
    constructor(private readonly userRepository: IUserRepository) {}

    async execute(userId: string, payoutData: ActivateProviderDTO): Promise<AuthUserDTO> {
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

        const isAlreadyActive =
            user.providerProfile.status.providerStatus === ProviderStatus.ACTIVE &&
            Boolean(user.providerProfile.payoutDetails?.accountHolderName && user.providerProfile.payoutDetails?.upiId);

        if (isAlreadyActive) {
            // Already activated with payout details -> return existing state idempotently
            return UserMapper.toAuthResponse(user, "SERVICE_PROVIDER");
        }

        // Validate basic presence (defensive in addition to schema validation)
        if (!payoutData.accountHolderName?.trim() || !payoutData.upiId?.trim()) {
            throw new ApiError(
                HttpStatusCode.BAD_REQUEST,
                "Account holder name and UPI ID are required to activate your provider account."
            );
        }

        const cleanAccountNumber = payoutData.bankAccountNumber?.trim() || undefined;
        const cleanIfsc = payoutData.ifscCode?.trim()?.toUpperCase() || undefined;

        if ((cleanAccountNumber && !cleanIfsc) || (cleanIfsc && !cleanAccountNumber)) {
            throw new ApiError(
                HttpStatusCode.BAD_REQUEST,
                "Bank account number and IFSC code must be provided together."
            );
        }

        user.providerProfile.payoutDetails = {
            accountHolderName: payoutData.accountHolderName.trim(),
            upiId: payoutData.upiId.trim().toLowerCase(),
            ...(cleanAccountNumber && {
                bankAccountNumber: cleanAccountNumber,
            }),
            ...(cleanIfsc && {
                ifscCode: cleanIfsc,
            }),
            submittedAt: new Date(),
        };

        user.providerProfile.status.providerStatus = ProviderStatus.ACTIVE;
        await this.userRepository.updateUser(user);

        return UserMapper.toAuthResponse(user, "SERVICE_PROVIDER");
    }
}
