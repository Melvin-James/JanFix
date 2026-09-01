import type { UploadedFile } from "../../../domain/entities/UploadedFile.js";

import type { ProviderType } from "../../../domain/enums/ProviderType.js";


export interface SubmitProviderApplicationDTO {


    providerType: ProviderType;


    providerName: string;


    responsiblePersonName: string;


    address: string;


    phone: string;


    identityProof: UploadedFile;


    categoriesWillingToWork: string[];


    websiteLinks?: string[];


    profileImage?: UploadedFile;


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