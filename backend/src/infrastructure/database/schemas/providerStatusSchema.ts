import { Schema } from "mongoose";

import { ApplicationStatus } from "../../../domain/enums/ApplicationStatus.js";

import { ProviderStatus } from "../../../domain/enums/ProviderStatus.js";

export const providerStatusSchema = new Schema(
    {

        applicationStatus: {

            type: String,

            enum: Object.values(ApplicationStatus),

            default: ApplicationStatus.SUBMITTED,
        },

        providerStatus: {

            type: String,
            
            enum: Object.values(ProviderStatus),
            
            required: false,
        
        },

        submittedAt: {

            type: Date,

            default: Date.now,
        },

        reviewedAt: {

            type: Date,
        },

        reviewedBy: {

            type: Schema.Types.ObjectId,

            ref: "User",
        },

        rejectionReason: {

            type: String,

            trim: true,

            maxlength: 500,

            default: null,
        },
    },
    {
        _id: false,
    }
);