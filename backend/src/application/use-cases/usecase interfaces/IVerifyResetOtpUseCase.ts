import type { VerifyResetOtpDTO } from "../../dto/auth/VerifyResetOtpDTO.js";

export interface IVerifyResetOtpUseCase {

    execute(dto: VerifyResetOtpDTO): Promise<string>;

}
