import type { IssueResponseDTO } from "../../../dto/issue/IssueResponseDTO.js";

export interface IApproveIssueUseCase {
    execute(issueId: string, serverNow?: Date): Promise<IssueResponseDTO>;
}
