import axiosInstance from "../../../api/axios";
import { ApiEndpoints } from "../../../shared/constants/apiEndpoints";
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
        ApiEndpoints.AUTH.REGISTER,
        data
    );
    return response.data;
};

export const verifyOtp = async (
    data: VerifyOtpPayload
): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.post<ApiResponse<void>>(ApiEndpoints.AUTH.VERIFY_OTP, data);
    return response.data;
};

export const loginUser = async (
    data: LoginFormData
): Promise<ApiResponse<AuthLoginResponseData>> => {
    const response = await axiosInstance.post<ApiResponse<AuthLoginResponseData>>(ApiEndpoints.AUTH.LOGIN, data);
    return response.data;
};

export const forgotPassword = async (
    data: ForgotPasswordData
): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.post<ApiResponse<void>>(ApiEndpoints.AUTH.FORGOT_PASSWORD, data);
    return response.data;
};

export const verifyResetOtp = async (
    data: VerifyResetOtpPayload
): Promise<ApiResponse<VerifyResetOtpResponseData>> => {
    const response = await axiosInstance.post<ApiResponse<VerifyResetOtpResponseData>>(
        ApiEndpoints.AUTH.VERIFY_RESET_OTP,
        data
    );
    return response.data;
};

export const resetPassword = async (
    data: ResetPasswordPayload
): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.post<ApiResponse<void>>(ApiEndpoints.AUTH.RESET_PASSWORD, data);
    return response.data;
};

export const logoutUser = async (): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.post<ApiResponse<void>>(ApiEndpoints.AUTH.LOGOUT);
    return response.data;
};

export const googleLogin = async (
    credential: string
): Promise<ApiResponse<AuthLoginResponseData>> => {
    const response = await axiosInstance.post<ApiResponse<AuthLoginResponseData>>(ApiEndpoints.AUTH.GOOGLE, { credential });
    return response.data;
};

export const resendOtp = async (
    data: ResendOtpPayload
): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.post<ApiResponse<void>>(ApiEndpoints.AUTH.RESEND_OTP, data);
    return response.data;
};

export interface SwitchModeResponseData {
    activeMode: "USER" | "SERVICE_PROVIDER";
    user: AuthLoginResponseData["user"];
    isActivated?: boolean;
}

export const switchMode = async (
    mode: "USER" | "SERVICE_PROVIDER"
): Promise<ApiResponse<SwitchModeResponseData>> => {
    const response = await axiosInstance.post<ApiResponse<SwitchModeResponseData>>(
        ApiEndpoints.AUTH.SWITCH_MODE,
        { mode }
    );
    return response.data;
};