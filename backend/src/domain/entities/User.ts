import { Role } from "../enums/Role.ts";

import { AuthProvider } from "../enums/AuthProvider.ts";

import type { ProviderProfile } from "./ProviderProfile.ts";

import type { AccountStatus } from "../enums/AccountStatus.ts";

import type { ApplicationMode } from "../../shared/types/AccessTokenPayload.ts";

export interface User {

    id?: string;

    fullName: string;

    email: string;

    password?: string;

    roles: Role[];

    activeMode: ApplicationMode;    

    isVerified: boolean;

    authProvider: AuthProvider;

    accountStatus: AccountStatus;

    googleId?: string;

    providerProfile?: ProviderProfile
    
}

