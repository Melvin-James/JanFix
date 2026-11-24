import type { AuthUserDTO } from "../../../dto/auth/AuthUserDTO.ts";
import type { ActivateProviderDTO } from "../../../dto/provider/ActivateProviderDTO.ts";

export interface IActivateProviderUseCase {
    execute(userId: string, payoutData: ActivateProviderDTO): Promise<AuthUserDTO>;
}
