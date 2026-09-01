import { Schema } from "mongoose";

export const organizationProfileSchema = new Schema(
    {
        memberCount: {
            type: Number,
        },
    },
    {
        _id: false,
    }
);