import type { UserRole } from "../../../types/user";
import type { AuthUser } from "./authUser";

export interface RegisterResponseData {
    id: string;
    fullName: string;
    email: string;
    roles: UserRole[];
    isVerified: boolean;
}

export interface VerifyOtpPayload {
    email: string;
    otp: string;
}

export interface ResendOtpPayload {
    email: string;
    purpose: "VERIFY_ACCOUNT" | "RESET_PASSWORD";
}

export interface VerifyResetOtpPayload {
    email: string;
    otp: string;
}

export interface VerifyResetOtpResponseData {
    resetToken: string;
}

export interface ResetPasswordPayload {
    resetToken: string;
    newPassword: string;
    confirmPassword: string;
}

export interface AuthLoginResponseData {
    user: AuthUser;
}
