import type { ResendOtpDTO } from "../../../dto/auth/ResendOtpDTO.ts";

export interface IResendOtpUseCase {

    execute(dto: ResendOtpDTO): Promise<void>;

}