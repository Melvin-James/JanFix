import type { AccountStatus } from "./AccountStatus";

import type { AuthProvider } from "./AuthProvider";

import type { UserRole } from "./UserRole";

export interface ManagedUser {
    id:string;
    fullName: string;
    email: string;
    roles:UserRole[];
    isVerified: boolean;
    authProvider: AuthProvider;
    accountStatus: AccountStatus;
}