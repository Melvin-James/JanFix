import { Schema } from "mongoose";

import { providerIdentitySchema } from "./providerIdentitySchema.js";

import { providerDocumentsSchema } from "./providerDocumentsSchema.js";

import { providerWorkPreferencesSchema } from "./providerWorkPreferencesSchema.js";

import { providerStatusSchema } from "./providerStatusSchema.js";

import { volunteerGroupProfileSchema } from "./volunteerGroupProfileSchema.js";

import { organizationProfileSchema } from "./organizationProfileSchema.js";

import { providerPayoutDetailsSchema } from "./providerPayoutDetailsSchema.js";

export const providerProfileSchema = new Schema(
    {
        identity: {
            type: providerIdentitySchema,
            default: () => ({})
        },

        documents: {
            type: providerDocumentsSchema,
            default: () => ({})
        },

        workPreferences: {
            type: providerWorkPreferencesSchema,
            default: () => ({})
        },

        volunteerGroupProfile: {
            type: volunteerGroupProfileSchema,
        },

        organizationProfile: {
            type: organizationProfileSchema,
        },

        status: {
            type: providerStatusSchema,
            default: () => ({})
        },

        payoutDetails: {
            type: providerPayoutDetailsSchema,
            required: false,
        }
    },
    {
        _id: false,
    }
);
