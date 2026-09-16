import type { OtpPurpose } from "../../../domain/enums/OtpPurpose.js";

export interface ResendOtpDTO {

    email: string;
    
    purpose: OtpPurpose;

}