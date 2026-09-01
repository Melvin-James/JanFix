import { Schema } from "mongoose";

import { ApplicationStatus } from "../../../domain/enums/ApplicationStatus.js";

export const providerStatusSchema = new Schema(
    {

        applicationStatus: {

            type: String,

            enum: Object.values(ApplicationStatus),

            default: ApplicationStatus.SUBMITTED,
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