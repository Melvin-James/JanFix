import type { User } from "../../domain/entities/User.js";

import type { UpdateServiceProviderStatusResponseDTO } from "../dto/admin/UpdateServiceProviderStatusResponseDTO.js";

export class UpdateServiceProviderStatusMapper {

    static toResponse(user: User): UpdateServiceProviderStatusResponseDTO {

        return {

            id: user.id as string,

            providerStatus: user.providerProfile!.status.providerStatus!,

        };

    }
    
}