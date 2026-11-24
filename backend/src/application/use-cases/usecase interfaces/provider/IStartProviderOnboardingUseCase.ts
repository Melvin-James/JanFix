import type { User } from "../../../../domain/entities/User.ts";

import type { ProviderType } from "../../../../domain/enums/ProviderType.ts";

export interface IStartProviderOnboardingUseCase {

  execute(userId: string, providerType: ProviderType): Promise<User>;
}