import { z } from "zod";
import { uploadedFileSchema } from "../common/uploadedFileSchema.js";
import { IssueVisibility } from "../../../domain/enums/IssueVisibility.js";

const coordinatesSchema = z.object({
    latitude: z
        .number({ message: "Latitude is required and must be a number" })
        .min(-90, "Latitude must be between -90 and 90")
        .max(90, "Latitude must be between -90 and 90"),
    longitude: z
        .number({ message: "Longitude is required and must be a number" })
        .min(-180, "Longitude must be between -180 and 180")
        .max(180, "Longitude must be between -180 and 180"),
});

const issueLocationSchema = z.object({
    address: z
        .string()
        .trim()
        .min(3, "Address must be at least 3 characters")
        .max(300, "Address must not exceed 300 characters"),
    coordinates: coordinatesSchema,
    locality: z.string().trim().max(100).optional(),
    city: z.string().trim().max(100).optional(),
    state: z.string().trim().max(100).optional(),
    postalCode: z.string().trim().max(20).optional(),
});

export const createIssueValidator = z.object({
    title: z
        .string({ message: "Title is required" })
        .trim()
        .min(5, "Title must be at least 5 characters")
        .max(150, "Title must not exceed 150 characters"),

    description: z
        .string({ message: "Description is required" })
        .trim()
        .min(10, "Description must be at least 10 characters")
        .max(3000, "Description must not exceed 3000 characters"),

    categoryId: z
        .string({ message: "Category ID is required" })
        .trim()
        .regex(/^[a-f\d]{24}$/i, "Please select a valid category."),

    images: z
        .array(uploadedFileSchema)
        .max(5, "A maximum of 5 photos is allowed")
        .default([]),

    visibility: z
        .enum([IssueVisibility.PUBLIC, IssueVisibility.PRIVATE], {
            message: "Visibility must be either PUBLIC or PRIVATE",
        }),

    location: issueLocationSchema,
});
