import type{ GoogleUser } from "../../../../domain/interface/IGoogleAuthService.js";

import type { AuthUserDTO } from "../../../dto/auth/AuthUserDTO.js";

export interface IGoogleAuthUseCase {
    execute(
        googleUser: GoogleUser
    ): Promise<{
        accessToken: string;
        refreshToken: string;
        user: AuthUserDTO;
    }>;
}