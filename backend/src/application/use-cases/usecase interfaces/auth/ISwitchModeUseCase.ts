import type { ApplicationMode } from "../../../../shared/types/AccessTokenPayload.js";
import type { AuthUserDTO } from "../../../dto/auth/AuthUserDTO.js";

export interface SwitchModeResult {
    activeMode: ApplicationMode;
    accessToken: string;
    user: AuthUserDTO;
    isActivated?: boolean;
}

export interface ISwitchModeUseCase {
    execute(userId: string, requestedMode: ApplicationMode): Promise<SwitchModeResult>;
}
