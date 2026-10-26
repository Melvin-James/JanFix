import type { ProviderProfile } from "../../provider/types/providerProfile";
import type { UserRole } from "../../admin/types/UserRole";
import type { AccountStatus } from "../../admin/types/AccountStatus";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  roles: UserRole[];
  isVerified: boolean;
  accountStatus?: AccountStatus;
  providerProfile?: ProviderProfile; 
}