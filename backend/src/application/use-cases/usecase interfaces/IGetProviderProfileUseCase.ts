import type { ProviderProfile } from "../../../domain/entities/ProviderProfile.js";

export interface IGetProviderProfileUseCase {

    execute(userId: string): Promise<ProviderProfile>;
}