import type { IssueResponseDTO } from "../../../dto/issue/IssueResponseDTO.js";
import type { Role } from "../../../../domain/enums/Role.js";

export interface IGetIssueByIdUseCase {
    execute(
        issueId: string,
        requestingUserId?: string,
        requestingUserRoles?: Role[]
    ): Promise<IssueResponseDTO>;
}
