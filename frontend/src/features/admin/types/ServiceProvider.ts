import { ProviderType } from "../../provider/types/providerTypes";

export type ProviderStatus =
    | "ACTIVE"
    | "BLOCKED";

export interface ServiceProvider {
    id: string;
    responsiblePersonName?: string;
    email: string;
    providerType?: ProviderType;
    providerName?: string;
    providerStatus: ProviderStatus;
}