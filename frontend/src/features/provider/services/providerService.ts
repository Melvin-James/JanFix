import axiosInstance from "../../../api/axios";

import { ProviderType } from "../types/providerTypes";

import type { CompleteProviderStep2Request } from "../types/providerStep2Types";

export const completeProviderStep1 = async (
    providerType: ProviderType
) => {
    const response = await axiosInstance.post("/provider/onboarding/step-1", { providerType });
    return response.data;
}

export const getProviderProfile =
    async () => {

        const response = await axiosInstance.get("/provider/profile");

        return response.data;
    };

export const completeProviderStep2 =
    async (data: CompleteProviderStep2Request) => {

        const response = await axiosInstance.put("/provider/onboarding/step-2", data);

        return response.data;
    };

export const submitProviderApplication =
    async () => {

        const response = await axiosInstance.post("/provider/onboarding/submit");

        return response.data;
    };