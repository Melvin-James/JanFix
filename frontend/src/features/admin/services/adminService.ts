import axiosInstance from "../../../api/axios";

import type { ProviderApplication, ProviderApplicationsDetails } from "../types/ProviderApplication";

import type { ProviderStatus, ServiceProvider } from "../types/ServiceProvider";

import type { ServiceProviderDetails } from "../types/ServiceProviderDetails";

import type { UpdateServiceProviderStatusResponse } from "../types/UpdateServiceProviderStatusResponse";

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


export const getServiceProviders = async (): Promise<ServiceProvider[]> => {

    const response = await axiosInstance.get(

        "/admin/service-providers"

    );

    return response.data.providers;
}

export const getServiceProviderDetails = async (

    userId: string

): Promise<ServiceProviderDetails> => {

    const response = await axiosInstance.get(

        `/admin/service-providers/${userId}`

    );

    return response.data.provider;

};

export const updateServiceProviderStatus = async (
    userId: string,
    status: ProviderStatus
): Promise<UpdateServiceProviderStatusResponse> => {

    const response = await axiosInstance.patch(
        `/admin/service-providers/${userId}/status`,
        {status}
    );

    return response.data.provider;
};