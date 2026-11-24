import type { IUserRepository } from "../../../domain/interface/IUserRepository.ts";
import type { IUpdateUserProfileUseCase } from "../usecase interfaces/auth/IUpdateUserProfileUseCase.ts";
import type { UpdateUserProfileDTO } from "../../dto/auth/UpdateUserProfileDTO.ts";
import type { AuthUserDTO } from "../../dto/auth/AuthUserDTO.ts";
import { UserMapper } from "../../mappers/LoginMapper.ts";
import ApiError from "../../../shared/utils/apiError.ts";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.ts";
import { AppMessages } from "../../../shared/constants/messages.ts";

export class UpdateUserProfileUseCase implements IUpdateUserProfileUseCase {
    constructor(private readonly _userRepository: IUserRepository) {}

    async execute(userId: string, dto: UpdateUserProfileDTO): Promise<AuthUserDTO> {
        if (!userId) {
            throw new ApiError(HttpStatusCode.UNAUTHORIZED, AppMessages.ERROR.UNAUTHORIZED);
        }

        const user = await this._userRepository.findById(userId);
        if (!user) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, AppMessages.ERROR.USER_NOT_FOUND);
        }

        const trimmedName = dto.fullName.trim();
        if (!trimmedName) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "Full name cannot be empty");
        }

        user.fullName = trimmedName;

        const updated = await this._userRepository.updateUser(user);
        return UserMapper.toAuthResponse(updated);
    }
}
