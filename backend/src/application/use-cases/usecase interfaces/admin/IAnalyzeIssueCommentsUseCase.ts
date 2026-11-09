import type { IssueAIAnalysisResponseDTO } from "../../../dto/admin/IssueAIAnalysisResponseDTO.js";

export interface IAnalyzeIssueCommentsUseCase {
    execute(issueId: string, serverNow?: Date): Promise<IssueAIAnalysisResponseDTO>;
}

