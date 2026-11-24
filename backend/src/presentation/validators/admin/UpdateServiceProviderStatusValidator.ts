import z from "zod";

import { ProviderStatus } from "../../../domain/enums/ProviderStatus.ts";

export const updateServiceProviderStatusSchema = z.object({

    status: z.enum([
        ProviderStatus.ACTIVE,
        ProviderStatus.BLOCKED,
    ])
})