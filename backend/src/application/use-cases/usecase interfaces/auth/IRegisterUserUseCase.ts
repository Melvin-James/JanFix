import type { RegisterUserDTO } from "../../../dto/auth/RegisterUserDTO.js";
import type { AuthUserDTO } from "../../../dto/auth/AuthUserDTO.js";

export interface IRegisterUserUseCase {
    execute(dto: RegisterUserDTO): Promise<AuthUserDTO>;
}
