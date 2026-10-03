import type { Role } from "../../domain/enums/Role.ts";

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                roles: Role[];
            }
        }
    }
}