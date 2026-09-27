import z from "zod";

export const createCategorySchema = z.object({

    name: z
        .string()
        .trim()
        .min(1, "Category name is required"),

    description: z
        .string()
        .trim()
        .min(1, "Category description is required"),
        
});

export const updateCategorySchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Category name is required"),

    description: z
        .string()
        .trim()
        .min(1, "Category description is required"),
});

export const updateCategoryStatusSchema = z.object({
    isActive: z.boolean().optional(),
    status: z.enum(["ACTIVE", "BLOCKED"]).optional(),
}).refine(
    (data) => data.isActive !== undefined || data.status !== undefined,
    { message: "Either isActive or status must be provided" }
);