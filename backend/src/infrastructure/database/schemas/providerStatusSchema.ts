import { Schema } from "mongoose";

import { OnboardingStatus } from "../../../domain/enums/OnboardingStatus.js";

import { VerificationStatus } from "../../../domain/enums/VerificationStatus.js";

export const providerStatusSchema = new Schema(
    {

        onboardingStatus: {

            type: String,

            enum: Object.values(OnboardingStatus),

            default: OnboardingStatus.STEP_1,
        },

        verificationStatus: {

            type: String,

            enum: Object.values(VerificationStatus),

            default: VerificationStatus.PENDING,
        },
    },
    {
        _id: false,
    }
);