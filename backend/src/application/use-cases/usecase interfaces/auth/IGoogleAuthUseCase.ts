import type{ GoogleUser } from "../../../../domain/interface/IGoogleAuthService.ts";

import type { AuthUserDTO } from "../../../dto/auth/AuthUserDTO.ts";

export interface IGoogleAuthUseCase {
    execute(
        googleUser: GoogleUser
    ): Promise<{
        accessToken: string;
        refreshToken: string;
        user: AuthUserDTO;
    }>;
}