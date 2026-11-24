import { Schema } from "mongoose";

import { uploadedFileSchema } from "./uploadedFileSchema.ts";

export const providerDocumentsSchema = new Schema(
    {
        identityProof: {
            type: uploadedFileSchema,
        },

        profileImage: {
            type: uploadedFileSchema,
        },

        ngoRegistrationDocument: {
            type: uploadedFileSchema,
        },

        logo: {
            type: uploadedFileSchema,
        },

        previousCommunityPhotos: [
            uploadedFileSchema,
        ],
    },
    {
        _id: false,
    }
);