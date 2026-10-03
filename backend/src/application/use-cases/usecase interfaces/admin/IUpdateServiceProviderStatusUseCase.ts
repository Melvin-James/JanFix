import type { ProviderStatus } from "../../../domain/enums/ProviderStatus.js";

import type { UpdateServiceProviderStatusResponseDTO } from "../../dto/admin/UpdateServiceProviderStatusResponseDTO.js"; 

export interface IUpdateServiceProviderStatusUseCase {

  execute(userId: string, status: ProviderStatus): Promise<UpdateServiceProviderStatusResponseDTO>;

}