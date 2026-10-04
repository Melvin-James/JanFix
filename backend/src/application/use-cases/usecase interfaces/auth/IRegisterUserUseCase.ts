import type { RegisterResponseDTO } from "../../../dto/auth/RegisterResponseDTO.js";

import type { RegisterUserDTO } from "../../../dto/auth/RegisterUserDTO.js";

export interface IRegisterUserUseCase {
    
    execute(dto: RegisterUserDTO): Promise<RegisterResponseDTO>;

}
