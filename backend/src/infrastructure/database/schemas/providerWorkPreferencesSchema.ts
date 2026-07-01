import { Schema } from "mongoose";

export const providerWorkPreferencesSchema = new Schema(
    {
        categoriesWillingToWork: [
            {
                type: String,
            },
        ],

        websiteLinks: [
            {
                type: String,
            },
        ],
    },
    {
        _id: false,
    }
);