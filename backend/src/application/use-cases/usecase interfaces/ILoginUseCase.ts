import type { LoginDTO } from "../../dto/auth/LoginDTO.js";

export interface ILoginUseCase {
    execute(dto: LoginDTO): Promise<any>;
}
