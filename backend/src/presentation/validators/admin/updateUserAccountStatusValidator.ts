import z from "zod";

import { AccountStatus } from "../../../domain/enums/AccountStatus.js";

export const updateUserAccountStatusSchema = z.object({

    status: z.enum([

        AccountStatus.ACTIVE,

        AccountStatus.BLOCKED,

    ]),

});