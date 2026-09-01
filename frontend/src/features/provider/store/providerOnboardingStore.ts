import { create } from "zustand";

import type { ProviderType } from "../types/providerTypes";

import type { UploadedFile  } from "../types/uploadedFile";

interface ProviderDraft {

    providerType?: ProviderType;


    providerName?: string;

    responsiblePersonName?: string;

    address?: string;

    phone?: string;


    identityProof?: UploadedFile;

    profileImage?: UploadedFile;


    categoriesWillingToWork?: string[];

    websiteLinks?: string[];


    previousCommunityPhotos?: UploadedFile[];


    volunteerGroupProfile?: {

        memberCount: number;

        logo?: UploadedFile;
    };


    organizationProfile?: {

        memberCount: number;

        ngoRegistrationDocument?: UploadedFile;

        logo?: UploadedFile;
    };
}


interface ProviderOnboardingStore {

    draft: ProviderDraft;


    updateDraft: (

        data: Partial<ProviderDraft>

    ) => void;


    clearDraft: () => void;
}

export const useProviderOnboardingStore = create<ProviderOnboardingStore>()((set) => ({


    draft: {},


    updateDraft: (data) =>

        set((state) => ({

            draft: {

                ...state.draft,

                ...data

            }

        })),



    clearDraft: () => set({ draft: {} })

}));