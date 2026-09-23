import type { ServiceProviderResponseDTO } from "../../dto/admin/ServiceProviderResponseDTO.js";

export interface IGetServiceProvidersUseCase {
    
    execute(): Promise<ServiceProviderResponseDTO[]>;

}