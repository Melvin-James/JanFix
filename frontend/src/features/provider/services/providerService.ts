import axiosInstance from "../../../api/axios";

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
    async (data: any) => {

        const response = await axiosInstance.post("/provider/onboarding/submit", data);

        return response.data;
    };