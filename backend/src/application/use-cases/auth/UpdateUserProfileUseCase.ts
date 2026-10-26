import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";
import type { IUpdateUserProfileUseCase } from "../usecase interfaces/auth/IUpdateUserProfileUseCase.js";
import type { UpdateUserProfileDTO } from "../../dto/auth/UpdateUserProfileDTO.js";
import type { AuthUserDTO } from "../../dto/auth/AuthUserDTO.js";
import { UserMapper } from "../../mappers/LoginMapper.js";
import ApiError from "../../../shared/utils/apiError.js";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";
import { AppMessages } from "../../../shared/constants/messages.js";

export class UpdateUserProfileUseCase implements IUpdateUserProfileUseCase {
    constructor(private readonly userRepository: IUserRepository) {}

    async execute(userId: string, dto: UpdateUserProfileDTO): Promise<AuthUserDTO> {
        if (!userId) {
            throw new ApiError(HttpStatusCode.UNAUTHORIZED, AppMessages.ERROR.UNAUTHORIZED);
        }

        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, AppMessages.ERROR.USER_NOT_FOUND);
        }

        const trimmedName = dto.fullName.trim();
        if (!trimmedName) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "Full name cannot be empty");
        }

        user.fullName = trimmedName;

        const updated = await this.userRepository.updateUser(user);
        return UserMapper.toAuthResponse(updated);
    }
}
