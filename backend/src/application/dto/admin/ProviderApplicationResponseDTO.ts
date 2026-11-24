import type { ApplicationStatus } from "../../../domain/enums/ApplicationStatus.ts";

import type { ProviderType } from "../../../domain/enums/ProviderType.ts";

export interface ProviderApplicationResponseDTO {
    id: string;
    fullName: string;
    email: string;
    providerType?: ProviderType;
    providerName?: string;
    applicationStatus: ApplicationStatus;
    submittedAt: Date;
}