import axiosInstance from "../../../api/axios";

export const registerUser = async (
    data: unknown
) => {
    const response = await axiosInstance.post(
        "/auth/register",
        data
    );

    return response.data;
}

export const verifyOtp = async (data: { email: string; otp: string; }) => {

    const response = await axiosInstance.post("/auth/verify-otp", data);

    return response.data;
};

export const loginUser = async (data: { email: string; password: string; }) => {

    const response = await axiosInstance.post("/auth/login", data);

    return response.data;
};

export const logoutUser = async () => {

    await axiosInstance.post("/auth/logout");
};