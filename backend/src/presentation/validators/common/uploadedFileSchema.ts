import { z } from "zod";

export const uploadedFileSchema = z.object({

    key: z
        .string()
        .min(1, "File key is required"),

    url: z
        .string()
        .url("Invalid file URL"),

    originalName: z
        .string()
        .min(1, "Original filename is required"),

    mimeType: z
        .string()
        .min(1, "MIME type is required"),

    size: z
        .number()
        .positive("File size must be greater than zero"),
});