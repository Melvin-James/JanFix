import type { Role } from "../../domain/enums/Role.js";

export interface AccessTokenPayload {
    userId: string;
    roles: Role[];
}