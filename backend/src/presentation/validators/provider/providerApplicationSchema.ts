import { z } from "zod";

import { ProviderType } from "../../../domain/enums/ProviderType.js";

import { uploadedFileSchema } from "../common/uploadedFileSchema.js";


export const providerApplicationSchema = z.object({


    providerType: z.enum([

        ProviderType.INDIVIDUAL,

        ProviderType.NGO,

        ProviderType.VOLUNTEER_GROUP,

    ]),



    providerName: z
        .string()
        .trim()
        .min(
            3,
            "Provider name must be at least 3 characters"
        ),



    responsiblePersonName: z
        .string()
        .trim()
        .min(
            3,
            "Responsible person name is required"
        ),



    address: z
        .string()
        .trim()
        .min(
            5,
            "Address is required"
        ),



    phone: z
        .string()
        .trim()
        .regex(
            /^[0-9]{10}$/,
            "Phone number must be 10 digits"
        ),



    identityProof:

        uploadedFileSchema,



    profileImage:

        uploadedFileSchema.optional(),



    categoriesWillingToWork:

        z.array(
            z.string()
        )
        .min(
            1,
            "Select at least one category"
        ),



    websiteLinks:

        z.array(
            z.string().url()
        )
        .optional(),




    previousCommunityPhotos:

        z.array(
            uploadedFileSchema
        )
        .optional(),





    volunteerGroupProfile:

        z.object({


            memberCount:

                z.number(),


            logo:

                uploadedFileSchema.optional(),


        })
        .optional(),






    organizationProfile:

        z.object({


            memberCount:

                z.number(),



            ngoRegistrationDocument:

                uploadedFileSchema.optional(),



            logo:

                uploadedFileSchema.optional(),

        })
        .optional(),


});