import type { VerifyResetOtpDTO } from "../../../dto/auth/VerifyResetOtpDTO.ts";

export interface IVerifyResetOtpUseCase {

    execute(dto: VerifyResetOtpDTO): Promise<string>;

}
