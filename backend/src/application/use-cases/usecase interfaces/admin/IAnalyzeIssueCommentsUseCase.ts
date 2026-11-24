import type { IssueAIAnalysisResponseDTO } from "../../../dto/admin/IssueAIAnalysisResponseDTO.ts";

export interface IAnalyzeIssueCommentsUseCase {
    execute(issueId: string, serverNow?: Date): Promise<IssueAIAnalysisResponseDTO>;
}

