import type { Role } from "../../../domain/enums/Role.js";

export interface LoginResponseDTO {

    accessToken: string;

    user: {

        id: string;

        fullName: string;

        email: string;

        roles: Role[];

        isVerified: boolean;
    };
}