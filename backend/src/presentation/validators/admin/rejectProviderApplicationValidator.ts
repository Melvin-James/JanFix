import {z} from "zod";

export const rejectProviderApplicationSchema = z.object({
    rejectionReason: z
        .string()
        .trim()
        .min(1, "Rejection reason is required")
});