import type { ForgotPasswordDTO } from "../../dto/auth/ForgotPasswordDTO.js"

export interface IForgotPasswordUseCase {
    execute(dto: ForgotPasswordDTO): Promise<void>
}