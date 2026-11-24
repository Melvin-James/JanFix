import type { User } from "../../domain/entities/User.ts";

import type { UpdateServiceProviderStatusResponseDTO } from "../dto/admin/UpdateServiceProviderStatusResponseDTO.ts";

export class UpdateServiceProviderStatusMapper {

    static toResponse(user: User): UpdateServiceProviderStatusResponseDTO {

        return {

            id: user.id as string,

            providerStatus: user.providerProfile!.status.providerStatus!,

        };

    }
    
}