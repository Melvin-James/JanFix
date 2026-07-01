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
    },
    {
        _id: false,
    }
);