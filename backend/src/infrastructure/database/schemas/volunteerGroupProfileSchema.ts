import { Schema } from "mongoose";

export const volunteerGroupProfileSchema = new Schema(
    {
        memberCount: {
            type: Number,
        },
    },
    {
        _id: false,
    }
);