import type { User } from "../../../../domain/entities/User.ts";

export interface IRejectProviderApplicationUseCase {
    execute (
        userId: string,
        rejectionReason: string
    ): Promise<User>;
}
