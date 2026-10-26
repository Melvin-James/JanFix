import type { AuthUserDTO } from "../../../dto/auth/AuthUserDTO.js";
import type { UpdateUserProfileDTO } from "../../../dto/auth/UpdateUserProfileDTO.js";

export interface IUpdateUserProfileUseCase {
    execute(userId: string, dto: UpdateUserProfileDTO): Promise<AuthUserDTO>;
}
