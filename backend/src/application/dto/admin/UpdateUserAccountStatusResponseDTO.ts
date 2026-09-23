import type { AccountStatus } from "../../../domain/enums/AccountStatus.js";

export interface UpdateUserAccountStatusResponseDTO {

    id: string;
    
    accountStatus: AccountStatus

}