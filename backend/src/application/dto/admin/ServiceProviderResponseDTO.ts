import type { ProviderType } from "../../../domain/enums/ProviderType.ts";

import type { ProviderStatus } from "../../../domain/enums/ProviderStatus.ts";

export interface ServiceProviderResponseDTO {
    
    id: string;
    
    responsiblePersonName?: string;
    
    email: string;
    
    providerType?: ProviderType;
    
    providerName?: string;
    
    providerStatus?: ProviderStatus | undefined;

}