import { z } from "zod";

import {
  ProviderType,
} from "../types/providerTypes";

export const providerStep1Schema =
  z.object({

    providerType: z.enum([

      ProviderType.INDIVIDUAL,

      ProviderType.VOLUNTEER_GROUP,

      ProviderType.NGO,

    ]),
  });

export type ProviderStep1FormData = z.infer<typeof providerStep1Schema>;