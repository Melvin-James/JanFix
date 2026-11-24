import z from "zod";

import { AccountStatus } from "../../../domain/enums/AccountStatus.ts";

export const updateUserAccountStatusSchema = z.object({

    status: z.enum([

        AccountStatus.ACTIVE,

        AccountStatus.BLOCKED,

    ]),

});