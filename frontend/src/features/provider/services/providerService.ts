import axiosInstance from "../../../api/axios";

import type { AuthUser } from "../../auth/types/authUser";

import type { ProviderProfile } from "../types/providerProfile";

export const getProviderProfile =
    async (): Promise<{
        success: boolean;
        provider: ProviderProfile;
    }> => {
        
        const response = await axiosInstance.get<{
            success: boolean;
            provider: ProviderProfile;
        }>("/provider/profile");

        return response.data;
    }


export const submitProviderApplication =
    async (data: any): Promise<{
        success: boolean;
        message: string;
        data: {
            user: AuthUser
        };
    }> => {

        const response = await axiosInstance.post<{
            success: boolean;
            message: string;
            data: {
                user: AuthUser;
            };
        }>("/provider/onboarding/submit", data);

        return response.data;
    };