import type { AuthUserDTO } from "../../../dto/auth/AuthUserDTO.js";

export interface IActivateProviderUseCase {
    execute(userId: string): Promise<AuthUserDTO>;
}
