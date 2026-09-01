import type { RegisterUserDTO } from "../../dto/auth/RegisterUserDTO.js";

export interface IRegisterUserUseCase {
    execute(dto: RegisterUserDTO): Promise<any>;
}
