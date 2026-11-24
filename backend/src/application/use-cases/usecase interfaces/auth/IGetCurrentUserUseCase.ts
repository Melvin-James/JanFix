import type { AuthUserDTO } from "../../../dto/auth/AuthUserDTO.ts";

export interface IGetCurrentUserUseCase {
    
    execute(userId: string): Promise<AuthUserDTO>;

}