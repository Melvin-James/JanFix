import type { IssueResponseDTO } from "../../../dto/issue/IssueResponseDTO.ts";
import type { Role } from "../../../../domain/enums/Role.ts";

export interface IGetIssueByIdUseCase {
    execute(
        issueId: string,
        requestingUserId?: string,
        requestingUserRoles?: Role[]
    ): Promise<IssueResponseDTO>;
}
