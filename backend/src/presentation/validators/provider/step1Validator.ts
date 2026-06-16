import { z } from "zod";

import { ProviderType } from "../../../domain/enums/ProviderType.js";

export const step1Schema = z.object({

  providerType: z.enum([
    ProviderType.INDIVIDUAL,
    ProviderType.NGO,
    ProviderType.VOLUNTEER_GROUP,
  ]),
});