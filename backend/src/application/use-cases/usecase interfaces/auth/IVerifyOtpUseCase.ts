import type { VerifyOtpDTO } from "../../dto/auth/VerifyOtpDTO.js";

export interface IVerifyOtpUseCase {
    execute(dto: VerifyOtpDTO): Promise<void>;
}
