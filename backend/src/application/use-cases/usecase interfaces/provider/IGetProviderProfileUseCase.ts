import type { ProviderProfile } from "../../../../domain/entities/ProviderProfile.ts";

export interface IGetProviderProfileUseCase {
    execute(userId: string, requestingUserId?: string): Promise<ProviderProfile>;
}