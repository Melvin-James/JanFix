import type{ GoogleUser } from "../../../../domain/interface/IGoogleAuthService.js";
import type { AccessTokenPayload } from "../../../../shared/types/AccessTokenPayload.js";
import type { RefreshTokenPayload } from "../../../../shared/types/RefreshTokenPayload.js";

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