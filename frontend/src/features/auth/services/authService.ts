import axiosInstance from "../../../api/axios";
import type { ApiResponse } from "../../../types/api";
import type { ForgotPasswordData } from "../validations/forgotPasswordSchema";
import type { LoginFormData } from "../validations/loginSchema";
import type { RegisterFormData } from "../validations/registerSchema";
import type {
    RegisterResponseData,
    VerifyOtpPayload,
    ResendOtpPayload,
    VerifyResetOtpPayload,
    VerifyResetOtpResponseData,
    ResetPasswordPayload,
    AuthLoginResponseData,
} from "../types/authPayloads";

export const registerUser = async (
    data: RegisterFormData
): Promise<ApiResponse<RegisterResponseData>> => {
    const response = await axiosInstance.post<ApiResponse<RegisterResponseData>>(
        "/auth/register",
        data
    );
    return response.data;
};

export const verifyOtp = async (
    data: VerifyOtpPayload
): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.post<ApiResponse<void>>("/auth/verify-otp", data);
    return response.data;
};

export const loginUser = async (
    data: LoginFormData
): Promise<ApiResponse<AuthLoginResponseData>> => {
    const response = await axiosInstance.post<ApiResponse<AuthLoginResponseData>>("/auth/login", data);
    return response.data;
};

export const forgotPassword = async (
    data: ForgotPasswordData
): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.post<ApiResponse<void>>("/auth/forgot-password", data);
    return response.data;
};

export const verifyResetOtp = async (
    data: VerifyResetOtpPayload
): Promise<ApiResponse<VerifyResetOtpResponseData>> => {
    const response = await axiosInstance.post<ApiResponse<VerifyResetOtpResponseData>>(
        "/auth/verify-reset-otp",
        data
    );
    return response.data;
};

export const resetPassword = async (
    data: ResetPasswordPayload
): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.post<ApiResponse<void>>("/auth/reset-password", data);
    return response.data;
};

export const logoutUser = async (): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.post<ApiResponse<void>>("/auth/logout");
    return response.data;
};

export const googleLogin = async (
    credential: string
): Promise<ApiResponse<AuthLoginResponseData>> => {
    const response = await axiosInstance.post<ApiResponse<AuthLoginResponseData>>("/auth/google", { credential });
    return response.data;
};

export const resendOtp = async (
    data: ResendOtpPayload
): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.post<ApiResponse<void>>("/auth/resend-otp", data);
    return response.data;
};