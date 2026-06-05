import mongoose from "mongoose";
import { Role } from "../../domain/enums/Role.js";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
        },

        password: {
            type: String,
            required: true,
        },

        role: {
            type: String,
            enum: Object.values(Role),
            default: Role.USER,
        },

        isVerified: {
            type: Boolean,
            default: false,
        },
        otp: {
            type: String,
            default: null
        },

        otpExpiresAt: {
            type: Date,
            default: null
        },
    },
    {
        timestamps: true,
    }
);

const UserModel = mongoose.model("User", userSchema);

export default UserModel;