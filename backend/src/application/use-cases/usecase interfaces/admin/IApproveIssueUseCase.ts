import type { IssueResponseDTO } from "../../../dto/issue/IssueResponseDTO.ts";

export interface IApproveIssueUseCase {
    execute(issueId: string, serverNow?: Date): Promise<IssueResponseDTO>;
}
