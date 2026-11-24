import type { Role } from "../../../domain/enums/Role.ts";

import type { AuthProvider } from "../../../domain/enums/AuthProvider.ts";

import type { AccountStatus } from "../../../domain/enums/AccountStatus.ts";

export interface UserManagementResponseDTO {

    id: string;

    fullName: string;
    
    email: string;
    
    roles: Role[];
    
    isVerified: boolean;
    
    authProvider: AuthProvider;
    
    accountStatus: AccountStatus;

}