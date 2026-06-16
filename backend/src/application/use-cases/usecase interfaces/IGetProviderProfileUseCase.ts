import type { ServiceProvider }
from "../../../domain/entities/ServiceProvider.js";

export interface IGetProviderProfileUseCase {

    execute(
        userId: string
    ): Promise<ServiceProvider>;
}