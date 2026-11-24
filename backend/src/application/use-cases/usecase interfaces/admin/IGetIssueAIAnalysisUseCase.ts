import type { IssueAIAnalysisResponseDTO } from "../../../dto/admin/IssueAIAnalysisResponseDTO.ts";

export interface IGetIssueAIAnalysisUseCase {
    execute(issueId: string, serverNow?: Date): Promise<IssueAIAnalysisResponseDTO>;
}

