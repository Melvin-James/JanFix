import z from "zod";

export const createCategorySchema = z.object({

    name: z
        .string()
        .trim()
        .min(1, "Category name is required")
        .max(100, "Category name must not exceed 100 characters"),

    description: z
        .string()
        .trim()
        .min(1, "Category description is required")
        .max(500, "Category description must not exceed 500 characters"),
        
});

export const updateCategorySchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Category name is required")
        .max(100, "Category name must not exceed 100 characters"),

    description: z
        .string()
        .trim()
        .min(1, "Category description is required")
        .max(500, "Category description must not exceed 500 characters"),
});

export const updateCategoryStatusSchema = z.object({
    isActive: z.boolean().optional(),
    status: z.enum(["ACTIVE", "BLOCKED"]).optional(),
}).refine(
    (data) => data.isActive !== undefined || data.status !== undefined,
    { message: "Either isActive or status must be provided" }
);
