import { Schema } from "mongoose";

export const issueLocationSchema = new Schema(
    {
        address: {
            type: String,
            required: true,
            trim: true,
        },
        coordinates: {
            latitude: {
                type: Number,
                required: true,
            },
            longitude: {
                type: Number,
                required: true,
            },
        },
        locality: {
            type: String,
            trim: true,
        },
        city: {
            type: String,
            trim: true,
        },
        state: {
            type: String,
            trim: true,
        },
        postalCode: {
            type: String,
            trim: true,
        },
    },
    {
        _id: false,
    }
);
