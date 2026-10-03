import type { ResendOtpDTO } from "../../dto/auth/ResendOtpDTO.js";

export interface IResendOtpUseCase {

    execute(dto: ResendOtpDTO): Promise<void>;

}