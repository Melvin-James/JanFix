import type{ GoogleUser } from "../../../domain/interface/IGoogleAuthService.js";

import type { LoginResponseDTO } from "../../dto/auth/LoginResponseDTO.js";

export interface IGoogleAuthUseCase {
    execute(
        googleUser: GoogleUser
    ): Promise<{
        accessToken: string;
        refreshToken: string;
        user: LoginResponseDTO["user"];
    }>;
}