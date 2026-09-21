import type { ApplicationStatus } from "../../../domain/enums/ApplicationStatus.js";

import type { ProviderType } from "../../../domain/enums/ProviderType.js";

export interface ProviderApplicationResponseDTO {
    id: string;
    fullName: string;
    email: string;
    providerType?: ProviderType;
    providerName?: string;
    applicationStatus: ApplicationStatus;
    submittedAt: Date;
}