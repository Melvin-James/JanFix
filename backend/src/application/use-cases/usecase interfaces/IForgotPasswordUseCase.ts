import type { ForgotPasswordDTO } from "../../dto/auth/ForgotPasswordDto.js"

export interface IForgotPasswordUseCase {
    execute(dto: ForgotPasswordDTO): Promise<void>
}