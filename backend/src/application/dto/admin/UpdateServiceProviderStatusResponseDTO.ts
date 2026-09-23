import { ProviderStatus } from "../../../domain/enums/ProviderStatus.js";

export interface UpdateServiceProviderStatusResponseDTO {
    id: string;
    providerStatus: ProviderStatus
}

