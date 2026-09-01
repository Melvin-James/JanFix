import type { ProviderProfile } from "../../provider/types/providerProfile";

export interface AuthUser {

  id: string;

  fullName: string;

  email: string;

  roles: ("USER" | "SERVICE_PROVIDER" | "ADMIN")[];

  isVerified: boolean;

  providerProfile?: ProviderProfile; 
}