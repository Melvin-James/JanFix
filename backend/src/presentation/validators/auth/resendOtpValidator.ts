import z from "zod";

import { OtpPurpose } from "../../../domain/enums/OtpPurpose.ts";

export const resendOtpSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Invalid email format"),

    purpose: z.enum(OtpPurpose)
})