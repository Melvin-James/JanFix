import type { ProviderType } from "../../../domain/enums/ProviderType.js";

import type { ProviderStatus } from "../../../domain/enums/ProviderStatus.js";

export interface ServiceProviderResponseDTO {
    
    id: string;
    
    responsiblePersonName?: string;
    
    email: string;
    
    providerType?: ProviderType;
    
    providerName?: string;
    
    providerStatus?: ProviderStatus | undefined;

}