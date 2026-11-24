import { Schema } from "mongoose";

import { providerIdentitySchema } from "./providerIdentitySchema.ts";

import { providerDocumentsSchema } from "./providerDocumentsSchema.ts";

import { providerWorkPreferencesSchema } from "./providerWorkPreferencesSchema.ts";

import { providerStatusSchema } from "./providerStatusSchema.ts";

import { volunteerGroupProfileSchema } from "./volunteerGroupProfileSchema.ts";

import { organizationProfileSchema } from "./organizationProfileSchema.ts";

import { providerPayoutDetailsSchema } from "./providerPayoutDetailsSchema.ts";

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
