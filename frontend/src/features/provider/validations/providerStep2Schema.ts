import { z } from "zod";

const uploadedFileSchema = z.object({

  key: z.string(),

  url: z.string(),

  originalName: z.string(),

  mimeType: z.string(),

  size: z.number(),

});


export const providerStep2Schema = z.object({

  providerName: z
    .string()
    .trim()
    .min(3, "Provider name must be at least 3 characters")
    .max(100, "Provider name cannot exceed 100 characters"),

  responsiblePersonName: z
    .string()
    .trim()
    .min(3, "Responsible person name is required")
    .max(100, "Responsible person name cannot exceed 100 characters"),

  address: z
    .string()
    .trim()
    .min(5, "Address is required"),

  phone: z
    .string()
    .trim()
    .regex(
      /^[0-9]{10}$/,
      "Phone number must be 10 digits"
    ),

  identityProof: uploadedFileSchema,

  profileImage: uploadedFileSchema.optional(),

  categoriesWillingToWork: z
    .array(z.string())
    .min(
      1,
      "Select at least one category"
    ),

  websiteLinks: z
    .array(z.string().url("Please enter a valid URL"))
    .max(5, "You can add a maximum of 5 links")
    .optional(),

  previousCommunityPhotos: z
    .array(uploadedFileSchema)
    .optional(),

  volunteerGroupProfile:

    z.object({

      memberCount: z.number()
                  .min(1, "Member count must be at least 1"),


      logo: uploadedFileSchema.optional(),


    })
      .optional(),

  organizationProfile: z
    .object({

      memberCount: z
        .number()
        .min(1, "Member count must be at least 1"),

      ngoRegistrationDocument:
        uploadedFileSchema.optional(),

      logo:
        uploadedFileSchema.optional(),

    })
    .optional(),
});

export type ProviderStep2FormData =
  z.infer<typeof providerStep2Schema>;