import type { AccountStatus } from "../../../domain/enums/AccountStatus.ts";

export interface UpdateUserAccountStatusResponseDTO {

    id: string;
    
    accountStatus: AccountStatus

}