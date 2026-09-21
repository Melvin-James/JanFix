import type { User } from "../../../domain/entities/User.js";

export interface IApproveProviderApplicationUseCase {
    execute(userId: string): Promise<User>
}

