import type { AuthUserDTO } from "../../../dto/auth/AuthUserDTO.ts";
import type { UpdateUserProfileDTO } from "../../../dto/auth/UpdateUserProfileDTO.ts";

export interface IUpdateUserProfileUseCase {
    execute(userId: string, dto: UpdateUserProfileDTO): Promise<AuthUserDTO>;
}
