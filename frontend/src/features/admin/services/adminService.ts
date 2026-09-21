import axiosInstance from "../../../api/axios";

import type { ProviderApplication, ProviderApplicationsDetails } from "../types/ProviderApplication";

export const getProviderApplications = async (): Promise<ProviderApplication[]> => {

    const response = await axiosInstance.get(

        "/admin/provider-applications"
    );

    return response.data.applications;
};

export const getProviderApplicationDetails = async (userId: string): Promise<ProviderApplicationsDetails> => {

    const response = await axiosInstance.get(

        `/admin/provider-applications/${userId}`
        
    )

    return response.data.application;
}

export const approveProviderApplication = async (
    userId: string
): Promise<void> => {
    await axiosInstance.patch(
        `/admin/provider-applications/${userId}/approve`
    );
};


export const rejectProviderApplication = async (
    userId: string,
    rejectionReason: string
): Promise<void> => {
    await axiosInstance.patch(
        `/admin/provider-applications/${userId}/reject`,
        {
            rejectionReason,
        }
    );
};