import type { IssueResponseDTO } from "../../../dto/issue/IssueResponseDTO.js";

export interface IGetIssueByIdUseCase {
    execute(issueId: string, requestingUserId: string): Promise<IssueResponseDTO>;
}
