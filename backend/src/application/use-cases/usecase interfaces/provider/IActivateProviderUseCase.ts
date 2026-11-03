import type { AuthUserDTO } from "../../../dto/auth/AuthUserDTO.js";
import type { ActivateProviderDTO } from "../../../dto/provider/ActivateProviderDTO.js";

export interface IActivateProviderUseCase {
    execute(userId: string, payoutData: ActivateProviderDTO): Promise<AuthUserDTO>;
}
