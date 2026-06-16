import type { ProviderType }
from "../../../domain/enums/ProviderType.js";

export interface ICompleteProviderStep1UseCase {

  execute(
    userId: string,
    providerType: ProviderType
  ): Promise<void>;
}