import type { IssueResponseDTO } from "../../../dto/issue/IssueResponseDTO.ts";

export interface IRejectIssueUseCase {
    execute(issueId: string, rejectionReason: string, serverNow?: Date): Promise<IssueResponseDTO>;
}
