import type { AuthUserDTO } from "../../../dto/auth/AuthUserDTO.js";

export interface SessionResult {
    user: AuthUserDTO;
    newAccessToken?: string;
}

export interface IGetCurrentSessionUseCase {

    /**
     * Resolves the current session from an access token or refresh token.
     * Returns the authenticated user and optionally a new access token
     * if the original was expired but the refresh token was valid.
     */
    execute(
        accessToken: string | undefined,
        refreshToken: string | undefined
    ): Promise<SessionResult>;

}
