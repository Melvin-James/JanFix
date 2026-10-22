
import { z } from "zod";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

const uploadedFileSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1, "The uploaded image is missing its storage key."),

  url: z
    .string()
    .url("The uploaded image URL is invalid."),

  originalName: z
    .string()
    .trim()
    .min(1, "The image filename is missing.")
    .max(255, "The image filename is too long."),

  mimeType: z.enum(ALLOWED_IMAGE_TYPES, {
    message: "Only JPEG, PNG, and WebP images are allowed.",
  }),

  size: z
    .number()
    .int("The image size is invalid.")
    .positive("The image must not be empty.")
    .max(MAX_IMAGE_SIZE, "Each image must be 5 MB or smaller."),
});

const coordinatesSchema = z.object({
  latitude: z
    .number({ message: "Please select a valid location." })
    .finite("Latitude must be a finite number.")
    .min(-90, "Latitude must be between -90 and 90.")
    .max(90, "Latitude must be between -90 and 90."),

  longitude: z
    .number({ message: "Please select a valid location." })
    .finite("Longitude must be a finite number.")
    .min(-180, "Longitude must be between -180 and 180.")
    .max(180, "Longitude must be between -180 and 180."),
});

const issueLocationSchema = z.object({
  address: z
    .string()
    .trim()
    .min(3, "Please enter a location with at least 3 characters.")
    .max(300, "The address must not exceed 300 characters."),

  coordinates: coordinatesSchema,

  locality: z.string().trim().max(100).optional(),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
  postalCode: z.string().trim().max(20).optional(),
});

export const issueFormSchema = z.object({
  title: z
    .string({ message: "Please enter an issue title." })
    .trim()
    .min(5, "The title must contain at least 5 characters.")
    .max(150, "The title must not exceed 150 characters.")
    .refine(
      (value) => /\S/.test(value),
      "The title cannot contain only spaces."
    ),

  description: z
    .string({ message: "Please describe the issue." })
    .trim()
    .min(10, "The description must contain at least 10 characters.")
    .max(3000, "The description must not exceed 3000 characters.")
    .refine(
      (value) => /\S/.test(value),
      "The description cannot contain only spaces."
    ),

  categoryId: z
    .string()
    .trim()
    .min(1, "Please select an issue category.")
    .regex(
      /^[a-f\d]{24}$/i,
      "Please select a valid issue category."
    ),

  visibility: z.preprocess(
    (value) =>
      value === null || value === "" || value === undefined
        ? undefined
        : value,
    z.enum(["PUBLIC", "PRIVATE"], {
      message: "Please choose whether this issue is public or private.",
    })
  ) as z.ZodType<"PUBLIC" | "PRIVATE">,

  images: z
    .array(uploadedFileSchema, {
      message: "The uploaded images are invalid.",
    })
    .min(1, "Please upload atleast one issue photo.")
    .max(5, "You can upload a maximum of 5 photos.")
    .default([]),

  location: z.preprocess(
    (value) =>
      value === null || value === undefined || value === ""
        ? undefined
        : value,
    issueLocationSchema.refine((val) => Boolean(val), {
      message: "Please specify the issue location.",
    })
  ) as z.ZodType<z.infer<typeof issueLocationSchema>>,
});

export type IssueFormData = z.infer<typeof issueFormSchema>;
