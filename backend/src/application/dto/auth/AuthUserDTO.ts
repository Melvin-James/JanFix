import type { Role } from "../../../domain/enums/Role.js";
import type { ProviderProfile } from "../../../domain/entities/ProviderProfile.js";
import type { AccountStatus } from "../../../domain/enums/AccountStatus.js";

export interface AuthUserDTO {
    id: string;
    fullName: string;
    email: string;
    roles: Role[];
    isVerified: boolean;
    accountStatus?: AccountStatus;
    providerProfile?: ProviderProfile;
}