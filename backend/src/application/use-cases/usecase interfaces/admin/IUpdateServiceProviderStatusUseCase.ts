import type { ProviderStatus } from "../../../../domain/enums/ProviderStatus.ts";

import type { UpdateServiceProviderStatusResponseDTO } from "../../../dto/admin/UpdateServiceProviderStatusResponseDTO.ts"; 

export interface IUpdateServiceProviderStatusUseCase {

  execute(userId: string, status: ProviderStatus): Promise<UpdateServiceProviderStatusResponseDTO>;

}