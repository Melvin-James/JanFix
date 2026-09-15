import type { OtpPurpose } from "../enums/OtpPurpose.js";

export interface IOtpRepository { 
    saveOtp( 
        email: string, 
        otp: string,
        purpose: OtpPurpose,
    ): Promise<void>; 
    
    getOtp( 
        email: string,
        purpose: OtpPurpose,
    ): Promise<string | null>; 
    
    deleteOtp( 
        email: string,
        purpose: OtpPurpose,
    ): Promise<void>; }