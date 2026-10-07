import z from "zod";

export const categorySchema = z.object ({
    name: z
        .string()
        .trim()
        .min(1, "Category name is required")
        .max(50, "Name must be less than 50 characters"),

    description: z
        .string()
        .trim()
        .min(1, "Category description is required")
        .max(200, "Description must be less than 200 characters"),
});

export type CategoryFormData = z.infer<typeof categorySchema>;