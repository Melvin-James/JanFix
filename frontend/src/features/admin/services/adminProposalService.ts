import axiosInstance from "../../../api/axios";
import type {
  AdminIssueProposalSummary,
  GetAdminIssuesWithProposalsParams,
  AdminIssueProposalsComparisonResponse,
  AdminProposalDetailsResponse,
  AdminProposalAIRecommendation,
  AdminProposalAISummary,
  SelectProposalResult,
} from "../types/adminProposalTypes";
import type { PaginatedResponse } from "../types/Pagination";

export const getIssuesWithProposals = async (
  params: GetAdminIssuesWithProposalsParams
): Promise<PaginatedResponse<AdminIssueProposalSummary>> => {
  const response = await axiosInstance.get("/admin/proposals", {
    params: {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search || undefined,
      category: params.category || undefined,
      sortBy: params.sortBy || undefined,
    },
  });

  const rawData = response.data;
  const items: AdminIssueProposalSummary[] = Array.isArray(rawData?.data)
    ? rawData.data
    : Array.isArray(rawData?.issues)
    ? rawData.issues
    : [];

  const pagination = rawData?.pagination ?? {
    page: params.page || 1,
    pageSize: params.pageSize || 10,
    totalItems: items.length,
    totalPages: 1,
  };

  return {
    items,
    pagination,
  };
};

export const getProposalsForIssue = async (
  issueId: string
): Promise<AdminIssueProposalsComparisonResponse> => {
  const response = await axiosInstance.get(`/admin/proposals/issues/${issueId}`);
  const payload = response.data.data || response.data;
  return {
    issue: payload.issue,
    proposals: payload.proposals || [],
    submittedProposalCount: payload.submittedProposalCount ?? payload.proposalCount ?? 0,
  };
};

export const getAdminProposalDetails = async (
  issueId: string,
  proposalId: string
): Promise<AdminProposalDetailsResponse> => {
  const response = await axiosInstance.get(
    `/admin/proposals/issues/${issueId}/proposals/${proposalId}`
  );
  const payload = response.data.data || response.data;
  return {
    proposal: payload.proposal,
    issue: payload.issue,
    provider: payload.provider,
  };
};

export const getIssueProposalRecommendation = async (
  issueId: string,
  forceRefresh = false
): Promise<AdminProposalAIRecommendation> => {
  const response = await axiosInstance.get(
    `/admin/proposals/issues/${issueId}/ai-recommendation`,
    {
      params: forceRefresh ? { forceRefresh: true } : undefined,
    }
  );
  return response.data.data || response.data.recommendation || response.data;
};

export const getProposalAISummary = async (
  issueId: string,
  proposalId: string,
  forceRefresh = false
): Promise<AdminProposalAISummary> => {
  const response = await axiosInstance.get(
    `/admin/proposals/issues/${issueId}/proposals/${proposalId}/ai-summary`,
    {
      params: forceRefresh ? { forceRefresh: true } : undefined,
    }
  );
  return response.data.data || response.data.summary || response.data;
};

export const selectProposal = async (
  issueId: string,
  proposalId: string
): Promise<SelectProposalResult> => {
  const response = await axiosInstance.patch(
    `/admin/proposals/issues/${issueId}/select/${proposalId}`
  );
  const payload = response.data.data;
  return payload.selection || payload;
};

