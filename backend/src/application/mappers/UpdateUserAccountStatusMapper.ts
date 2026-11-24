import type { User } from "../../domain/entities/User.ts";

import type { UpdateUserAccountStatusResponseDTO } from "../dto/admin/UpdateUserAccountStatusResponseDTO.ts";

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