import type { ProviderApplicationDetailsResponseDTO } from "../../../dto/admin/ProviderApplicationDetailsResponseDTO.ts";

export interface IGetProviderApplicationDetailsUseCase {

    execute(userId: string): Promise<ProviderApplicationDetailsResponseDTO>;

}