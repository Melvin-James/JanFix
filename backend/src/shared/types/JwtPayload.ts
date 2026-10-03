import type { Role } from "../../domain/enums/Role.js";

export interface JwtPayload {
    userId: string;
    roles: Role[];
}