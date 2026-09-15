import axiosInstance from "../../../api/axios";

import type { ForgotPasswordData } from "../validations/forgotPasswordSchema";

import type { LoginFormData } from "../validations/loginSchema";

import type { RegisterFormData } from "../validations/registerSchema";

export const registerUser = async (
    data: RegisterFormData
) => {
    const response = await axiosInstance.post(
        "/auth/register",
        data
    );

    return response.data;
}

export const verifyOtp = async (data: { email: string; otp: string }) => {

    const response = await axiosInstance.post("/auth/verify-otp", data);

    return response.data;
};

export const loginUser = async (data: LoginFormData) => {

    const response = await axiosInstance.post("/auth/login", data);

    return response.data;
};

export const forgotPassword = async(data: ForgotPasswordData) => {

    const response = await axiosInstance.post("/auth/forgot-password",data);
    
    return response.data;
}

export const  verifyResetOtp = async (data: {email: string, otp: string}) => {

    const response = await axiosInstance.post("/auth/verify-reset-otp", data);

    return response.data;
}

export const resetPassword = async (data: {resetToken: string, newPassword: string, confirmPassword: string}) => {
    
    const response = await axiosInstance.post("/auth/reset-password", data);

    return response.data;
}

export const logoutUser = async () => {

    await axiosInstance.post("/auth/logout");
};

export const googleLogin = async (credential: string) => {
    const response = await axiosInstance.post("/auth/google", {credential})

    return response.data;
}