import type { ProviderProfile } from "../../provider/types/providerProfile";

import type { UserRole } from "../../admin/types/UserRole";

export interface AuthUser {

  id: string;

  fullName: string;

  email: string;

  roles: UserRole[];

  isVerified: boolean;

  providerProfile?: ProviderProfile; 
}