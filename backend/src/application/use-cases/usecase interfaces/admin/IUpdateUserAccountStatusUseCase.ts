import type { AccountStatus } from "../../../../domain/enums/AccountStatus.ts";

import type { UpdateUserAccountStatusResponseDTO } from "../../../dto/admin/UpdateUserAccountStatusResponseDTO.ts";

export interface IUpdateUserAccountStatusUseCase {
    execute(
        userId: string,
        status: AccountStatus,
    ): Promise<UpdateUserAccountStatusResponseDTO>;
}

