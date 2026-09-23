import type { User } from "../../domain/entities/User.js";

import type { UpdateUserAccountStatusResponseDTO } from "../dto/admin/UpdateUserAccountStatusResponseDTO.js";

export class UpdateUserAccountStatusMapper {
    static toResponse(
        user: User
    ): UpdateUserAccountStatusResponseDTO {
        return {
            id: user.id as string,
            accountStatus: user.accountStatus
        };
    }
}