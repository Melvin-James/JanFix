import type { ForgotPasswordDTO } from "../../../dto/auth/ForgotPasswordDTO.ts"

export interface IForgotPasswordUseCase {
    execute(dto: ForgotPasswordDTO): Promise<void>
}