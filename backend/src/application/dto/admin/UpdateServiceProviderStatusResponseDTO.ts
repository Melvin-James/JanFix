import { ProviderStatus } from "../../../domain/enums/ProviderStatus.ts";

export interface UpdateServiceProviderStatusResponseDTO {
    id: string;
    providerStatus: ProviderStatus
}

