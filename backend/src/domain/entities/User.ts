import { Role } from "../enums/Role.js";

import { AuthProvider } from "../enums/AuthProvider.js";

import type { ProviderProfile } from "./ProviderProfile.js";

import type { AccountStatus } from "../enums/AccountStatus.js";

export interface User {

    id?: string;

    fullName: string;

    email: string;

    password: string;

    roles: Role[];

    isVerified: boolean;

    authProvider: AuthProvider;

    accountStatus: AccountStatus;

    googleId?: string;

    providerProfile?: ProviderProfile
    
}

