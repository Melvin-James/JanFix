import type { User } from "../../domain/entities/User.js";

import type {ProviderApplicationDetailsResponseDTO} from "../dto/admin/ProviderApplicationDetailsResponseDTO.js"

export class ProviderApplicationDetailsMapper {
    static toResponse(
        user: User
    ): ProviderApplicationDetailsResponseDTO {
        return {
            id: user.id as string,

            fullName: user.fullName,

            email: user.email,

            identity: {
                ...user.providerProfile!.identity,
            },

            documents: {
                ...user.providerProfile!.documents,
            },

            workPreferences: {
                ...user.providerProfile!.workPreferences
            },

            ...(user.providerProfile!.volunteerGroupProfile && {
                volunteerGroupProfile: {
                    ...user.providerProfile!.volunteerGroupProfile,
                },
            }),

            ...(user.providerProfile!.organizationProfile && {
                organizationProfile: {
                    ...user.providerProfile!.organizationProfile,
                }
            }),

            status: {
                ...user.providerProfile!.status,
            },
        };
    }
}