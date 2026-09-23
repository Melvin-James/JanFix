import type { User } from "../../domain/entities/User.js";

import type { ServiceProviderResponseDTO } from "../dto/admin/ServiceProviderResponseDTO.js";

export class ServiceProviderMapper {

    static toResponse(user: User): ServiceProviderResponseDTO {

        const providerProfile = user.providerProfile!;

        return {

            id: user.id as string,

            email: user.email,

            providerStatus: providerProfile.status.providerStatus,

            ...(providerProfile.identity.responsiblePersonName && {
                responsiblePersonName: providerProfile.identity.responsiblePersonName,
            }),

            ...(providerProfile.identity.providerType && {
                providerType: providerProfile.identity.providerType,
            }),

            ...(providerProfile.identity.providerName && {
                providerName: providerProfile.identity.providerName,
            }),
        };
    }
}