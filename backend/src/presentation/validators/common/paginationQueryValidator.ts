import { z } from "zod";

export const paginationQuerySchema = z.object({
    page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 1))
        .refine((val) => !isNaN(val) && val >= 1, {
            message: "Page must be a positive integer greater than or equal to 1",
        }),
    pageSize: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 10))
        .refine((val) => !isNaN(val) && val >= 1 && val <= 100, {
            message: "PageSize must be an integer between 1 and 100",
        }),
    search: z.string().optional(),
});
