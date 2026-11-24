import type { AuthUserDTO } from "../../../dto/auth/AuthUserDTO.ts";

export interface IRefreshTokenUseCase {
    
    execute(refreshToken: string): Promise<{
        accessToken: string;
        user: AuthUserDTO;
    }>;

}
