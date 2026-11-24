import type { VerifyOtpDTO } from "../../../dto/auth/VerifyOtpDTO.ts";

export interface IVerifyOtpUseCase {
    execute(dto: VerifyOtpDTO): Promise<void>;
}
