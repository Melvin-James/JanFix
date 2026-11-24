import type { ResetPasswordDTO } from "../../../dto/auth/ResetPasswordDTO.ts";

export interface IResetPasswordUseCase {
    execute(dto: ResetPasswordDTO): Promise<void>
}