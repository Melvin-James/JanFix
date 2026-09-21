import type { ProviderApplicationDetailsResponseDTO } from "../../dto/admin/ProviderApplicationDetailsResponseDTO.js";

export interface IGetProviderApplicationDetailsUseCase {

    execute(userId: string): Promise<ProviderApplicationDetailsResponseDTO>;

}