import type { ApplicationMode } from "../../../../shared/types/AccessTokenPayload.ts";
import type { AuthUserDTO } from "../../../dto/auth/AuthUserDTO.ts";

export interface SwitchModeResult {
    activeMode: ApplicationMode;
    accessToken: string;
    user: AuthUserDTO;
    isActivated?: boolean;
}

export interface ISwitchModeUseCase {
    execute(userId: string, requestedMode: ApplicationMode): Promise<SwitchModeResult>;
}
