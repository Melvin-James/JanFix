import type { User } from "../../../domain/entities/User.js";

import type { ProviderType } from "../../../domain/enums/ProviderType.js";

export interface IStartProviderOnboardingUseCase {

  execute(userId: string, providerType: ProviderType): Promise<User>;
}