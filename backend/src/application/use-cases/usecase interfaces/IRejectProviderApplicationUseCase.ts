import type { User } from "../../../domain/entities/User.js";

export interface IRejectProviderApplicationUseCase {
    execute (
        userId: string,
        rejectionReason: string
    ): Promise<User>;
}
