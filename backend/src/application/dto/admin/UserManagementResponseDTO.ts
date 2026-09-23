import type { Role } from "../../../domain/enums/Role.js";

import type { AuthProvider } from "../../../domain/enums/AuthProvider.js";

import type { AccountStatus } from "../../../domain/enums/AccountStatus.js";

export interface UserManagementResponseDTO {
    id: string;
    fullName: string;
    email: string;
    roles: Role[];
    isVerified: boolean;
    authProvider: AuthProvider;
    accountStatus: AccountStatus;
}