import type { Role } from "../../domain/enums/Role.ts";
import type { ApplicationMode } from "./AccessTokenPayload.js";

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                roles: Role[];
                activeMode?: ApplicationMode;
            }
        }
    }
}