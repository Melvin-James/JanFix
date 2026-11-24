import type { Role } from "../../../domain/enums/Role.ts";
import type { ProviderProfile } from "../../../domain/entities/ProviderProfile.ts";
import type { AccountStatus } from "../../../domain/enums/AccountStatus.ts";
import type { ApplicationMode } from "../../../shared/types/AccessTokenPayload.ts";

export interface ProviderAccessSummary {
    isApproved: boolean;
    isActivated: boolean;
    hasPayoutDetails?: boolean;
}

export interface AuthUserDTO {
    id: string;
    fullName: string;
    email: string;
    roles: Role[];
    isVerified: boolean;
    accountStatus?: AccountStatus;
    activeMode?: ApplicationMode;
    providerAccess?: ProviderAccessSummary;
    providerProfile?: ProviderProfile;
}
