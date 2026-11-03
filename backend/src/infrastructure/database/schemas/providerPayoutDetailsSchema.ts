import { Schema } from "mongoose";

export const providerPayoutDetailsSchema = new Schema(
    {
        accountHolderName: {
            type: String,
            required: true,
            trim: true,
        },
        upiId: {
            type: String,
            required: true,
            trim: true,
        },
        bankAccountNumber: {
            type: String,
            required: false,
            trim: true,
        },
        ifscCode: {
            type: String,
            required: false,
            trim: true,
            uppercase: true,
        },
        submittedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        _id: false,
    }
);

