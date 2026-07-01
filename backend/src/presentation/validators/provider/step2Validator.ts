import { z } from "zod";

export const step2Schema = z.object({

  providerName: z
    .string()
    .trim()
    .min(3, "Provider name must be at least 3 characters")
    .max(100, "Provider name cannot exceed 100 characters"),

  responsiblePersonName: z
    .string()
    .trim()
    .min(3, "Responsible person name is required"),

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

  identityProof: z
  .string()
  .trim()
  .min(1, "Government ID is required"),

  // profileImage: z
  //   .string()
  //   .trim()
  //   .min(1, "Profile image is required"),

  categoriesWillingToWork: z
    .array(z.string())
    .min(
      1,
      "Select at least one category"
    ),

  websiteLinks: z
    .array(z.string().url())
    .optional(),

  previousCommunityPhotos: z
    .array(z.string())
    .optional(),

  volunteerGroupProfile: z
    .object({

      memberCount:
        z.number(),

      logo:
        z.string().optional(),

    })
    .optional(),

  organizationProfile: z
    .object({

      memberCount:
        z.number(),

      ngoRegistrationDocument:
        z.string().optional(),

      logo:
        z.string().optional(),

    })
    .optional(),
});