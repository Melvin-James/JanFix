import type { AuthUserDTO } from "../../../dto/auth/AuthUserDTO.js";
import type { LoginDTO } from "../../../dto/auth/LoginDTO.js";

export interface ILoginUseCase {
    execute(dto: LoginDTO): Promise<{
        accessToken: string;
        refreshToken: string;
        user: AuthUserDTO;
    }>;
}
