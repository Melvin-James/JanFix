import { Schema } from "mongoose";

export const providerWorkPreferencesSchema = new Schema(
    {
        categoriesWillingToWork: [
            {
                type: Schema.Types.ObjectId,
                ref: "Category",
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