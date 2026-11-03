import axiosInstance from "../../../api/axios";

import type { AuthUser } from "../../auth/types/authUser";

import type { ProviderProfile } from "../types/providerProfile";

import type { ProviderDraft } from "../store/providerOnboardingStore";

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
    async (data: ProviderDraft): Promise<{
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


export const resubmitProviderApplication =
    async (data: ProviderDraft): Promise<{
        success: boolean;
        message: string;
        data: {
            user: AuthUser;
        };
    }> => {

        const response = await axiosInstance.post<{
            success: boolean;
            message: string;
            data: {
                user: AuthUser;
            };
        }>("/provider/onboarding/resubmit", data);

        return response.data;
    };

export const activateProvider = async (): Promise<{
    success: boolean;
    message: string;
    data: {
        user: AuthUser;
    };
}> => {
    const response = await axiosInstance.post<{
        success: boolean;
        message: string;
        data: {
            user: AuthUser;
        };
    }>("/provider/activate");
    return response.data;
};

export interface GetProviderIssuesParams {
    page?: number;
    pageSize?: number;
    category?: string;
    search?: string;
}

export const getProviderIssues = async (
    params?: GetProviderIssuesParams
): Promise<import("../types/providerTypes").ProviderIssuesResponse> => {
    const response = await axiosInstance.get<import("../types/providerTypes").ProviderIssuesResponse>(
        "/provider/issues",
        { params }
    );
    return response.data;
};

export const expressInterest = async (
    issueId: string
): Promise<{
    success: boolean;
    message: string;
}> => {
    const response = await axiosInstance.post<{
        success: boolean;
        message: string;
    }>(`/provider/issues/${issueId}/interest`);
    return response.data;
};