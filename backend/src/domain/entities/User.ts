import { Role } from "../enums/Role.js";

import type { ProviderProfile } from "./ProviderProfile.js";

export interface User {

    id?: string;

    fullName: string;

    email: string;

    password: string;

    roles: Role[];

    isVerified: boolean;

    authProvider: "LOCAL" | "GOOGLE";

    googleId?: string;

    providerProfile?: ProviderProfile
    
}

