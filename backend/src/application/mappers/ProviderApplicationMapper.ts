import type { User } from "../../domain/entities/User.js";

import type { ProviderApplicationResponseDTO } from "../dto/admin/ProviderApplicationResponseDTO.js";

export class ProviderApplicationMapper {
    static toResponse(user: User): ProviderApplicationResponseDTO {

        return {

            id: user.id as string,

            fullName: user.fullName,

            email: user.email,

           ...(user.providerProfile?.identity.providerType && {
            providerType: user.providerProfile.identity.providerType,
           }),

           ...(user.providerProfile?.identity.providerName && {
            providerName: user.providerProfile.identity.providerName,
           }),

            applicationStatus: user.providerProfile!.status.applicationStatus,
            
            submittedAt: user.providerProfile!.status.submittedAt,
            
        }
    }
}