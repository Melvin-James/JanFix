import type { AccountStatus } from "../../../../domain/enums/AccountStatus.js";

import type { UpdateUserAccountStatusResponseDTO } from "../../../dto/admin/UpdateUserAccountStatusResponseDTO.js";

export interface IUpdateUserAccountStatusUseCase {
    execute(
        userId: string,
        status: AccountStatus,
    ): Promise<UpdateUserAccountStatusResponseDTO>;
}

