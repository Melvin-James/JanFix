import type { IssueAIAnalysis } from "../entities/IssueAIAnalysis.ts";

export interface IIssueAIAnalysisRepository {
    findByIssueId(issueId: string): Promise<IssueAIAnalysis | null>;
    save(analysis: IssueAIAnalysis): Promise<IssueAIAnalysis>;
    acquireProcessingLock(
        issueId: string,
        cutoffDate: Date
    ): Promise<{ acquired: boolean; analysis: IssueAIAnalysis | null }>;
    markFailed(issueId: string, errorMessage: string): Promise<IssueAIAnalysis | null>;
}

