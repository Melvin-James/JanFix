import type { AuthUserDTO } from "../../../dto/auth/AuthUserDTO.js";

export interface IGetCurrentUserUseCase {
    
    execute(userId: string): Promise<AuthUserDTO>;

}