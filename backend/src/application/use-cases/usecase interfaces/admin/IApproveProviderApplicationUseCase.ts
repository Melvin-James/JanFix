import type { User } from "../../../../domain/entities/User.ts";

export interface IApproveProviderApplicationUseCase {
    execute(userId: string): Promise<User>
}

