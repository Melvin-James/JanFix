import mongoose from "mongoose";

import { Role } from "../../domain/enums/Role.js";

import { providerProfileSchema } from "../database/schemas/providerProfileSchema.js";

const userSchema = new mongoose.Schema(
{
    fullName: {
        type: String,
        required: true,
        trim: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },

    password: {
        type: String,
        required: false,
    },

    roles: {
        type: [{
            type: String,
            enum: Object.values(Role),
        }],
        default: [Role.USER],
    },

    isVerified: {
        type: Boolean,
        default: false,
    },

    authProvider: {
        type: String,
        enum: ["LOCAL", "GOOGLE"],
        default: "LOCAL"
    },

    googleId: {
        type: String,
        sparse: true,
    },

    providerProfile: {
        type: providerProfileSchema,
        default: undefined,
    }
},
{
    timestamps: true,
});

const UserModel = mongoose.model("User", userSchema);

export default UserModel;