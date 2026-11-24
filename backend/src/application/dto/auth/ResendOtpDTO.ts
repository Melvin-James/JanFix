import type { OtpPurpose } from "../../../domain/enums/OtpPurpose.ts";

export interface ResendOtpDTO {

    email: string;
    
    purpose: OtpPurpose;

}