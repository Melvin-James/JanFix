import type { ProviderApplicationResponseDTO } from "../../dto/admin/ProviderApplicationResponseDTO.js";

export interface IGetProviderApplicationsUseCase {

    execute(): Promise<ProviderApplicationResponseDTO[]>;
    
}