import type { Role } from "../../domain/enums/Role.ts";

export type ApplicationMode = "USER" | "SERVICE_PROVIDER";

export interface AccessTokenPayload {
    userId: string;
    roles: Role[];
    activeMode?: ApplicationMode;
}