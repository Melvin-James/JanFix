import { Schema } from "mongoose";

export const uploadedFileSchema = new Schema(
    {
        key: {
            type: String,
            required: true,
        },

        url: {
            type: String,
            required: true,
        },

        originalName: {
            type: String,
            required: true,
        },

        mimeType: {
            type: String,
            required: true,
        },

        size:{
            type: Number,
            required: true,
        },
    },
    {
        _id: false,
    }
);