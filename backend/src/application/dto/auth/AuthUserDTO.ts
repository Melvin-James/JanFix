import type { Role } from "../../../domain/enums/Role.js";
import type { ProviderProfile } from "../../../domain/entities/ProviderProfile.js";
import type { AccountStatus } from "../../../domain/enums/AccountStatus.js";

export interface ProviderAccessSummary {
    isApproved: boolean;
    isActivated: boolean;
}

export interface AuthUserDTO {
    id: string;
    fullName: string;
    email: string;
    roles: Role[];
    isVerified: boolean;
    accountStatus?: AccountStatus;
    activeMode?: "USER" | "SERVICE_PROVIDER";
    providerAccess?: ProviderAccessSummary;
    providerProfile?: ProviderProfile;
}