import type { ServiceProviderDetailsResponseDTO } from "../../../dto/admin/ServiceProviderDetailsResponseDTO.ts";

export interface IGetServiceProviderDetailsUseCase {
    execute(userId: string): Promise<ServiceProviderDetailsResponseDTO>;
}