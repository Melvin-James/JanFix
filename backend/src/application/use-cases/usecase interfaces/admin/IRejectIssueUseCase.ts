import type { IssueResponseDTO } from "../../../dto/issue/IssueResponseDTO.js";

export interface IRejectIssueUseCase {
    execute(issueId: string, rejectionReason: string, serverNow?: Date): Promise<IssueResponseDTO>;
}
