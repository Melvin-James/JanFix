import type { ServiceProviderDetailsResponseDTO } from "../../dto/admin/ServiceProviderDetailsResponseDTO.js";

export interface IGetServiceProviderDetailsUseCase {
    execute(userId: string): Promise<ServiceProviderDetailsResponseDTO>;
}