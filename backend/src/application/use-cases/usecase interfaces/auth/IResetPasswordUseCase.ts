import type { ResetPasswordDTO } from "../../dto/auth/ResetPasswordDTO.js";

export interface IResetPasswordUseCase {
    execute(dto: ResetPasswordDTO): Promise<void>
}