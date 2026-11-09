import type { IssueAIAnalysisResponseDTO } from "../../../dto/admin/IssueAIAnalysisResponseDTO.js";

export interface IGetIssueAIAnalysisUseCase {
    execute(issueId: string, serverNow?: Date): Promise<IssueAIAnalysisResponseDTO>;
}

