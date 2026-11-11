import type { AuthUserDTO } from "../../../dto/auth/AuthUserDTO.js";

export interface IRefreshTokenUseCase {
    
    execute(refreshToken: string): Promise<{
        accessToken: string;
        user: AuthUserDTO;
    }>;

}
