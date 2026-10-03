import type { AuthUserDTO } from "./AuthUserDTO.js";

export interface LoginResponseDTO {

    accessToken: string;

    user: AuthUserDTO
}