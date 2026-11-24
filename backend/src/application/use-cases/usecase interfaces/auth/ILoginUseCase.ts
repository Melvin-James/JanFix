import type { AuthUserDTO } from "../../../dto/auth/AuthUserDTO.ts";
import type { LoginDTO } from "../../../dto/auth/LoginDTO.ts";

export interface ILoginUseCase {
    execute(dto: LoginDTO): Promise<{
        accessToken: string;
        refreshToken: string;
        user: AuthUserDTO;
    }>;
}
