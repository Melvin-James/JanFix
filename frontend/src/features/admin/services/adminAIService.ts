import axiosInstance from "../../../api/axios";
import type { IssueAIAnalysisResponse } from "../types/adminAITypes";

export const getIssueAIAnalysis = async (issueId: string): Promise<IssueAIAnalysisResponse> => {
  const response = await axiosInstance.get<IssueAIAnalysisResponse>(
    `/admin/issues/${issueId}/ai-analysis`
  );
  return response.data;
};

export const triggerIssueAIAnalysis = async (issueId: string): Promise<IssueAIAnalysisResponse> => {
  const response = await axiosInstance.post<IssueAIAnalysisResponse>(
    `/admin/issues/${issueId}/ai-analysis/analyze`
  );
  return response.data;
};