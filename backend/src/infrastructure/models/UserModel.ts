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
        },

        otpExpiresAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const UserModel = mongoose.model("User", userSchema);

export default UserModel;