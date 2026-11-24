import type { RegisterUserDTO } from "../../../dto/auth/RegisterUserDTO.ts";
import type { AuthUserDTO } from "../../../dto/auth/AuthUserDTO.ts";

export interface IRegisterUserUseCase {
    execute(dto: RegisterUserDTO): Promise<AuthUserDTO>;
}
