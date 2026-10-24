import axiosInstance from "../../../api/axios";
import type {
  CreateIssuePayload,
  CreateIssueResponse,
  FeedIssuesParams,
  FeedIssuesResponse,
  IssueDetailsResponse,
  UserIssuesResponse,
} from "../types/issue";
import type { Category } from "../../admin/types/Category";

export const getActiveIssueCategories = async (): Promise<Category[]> => {
  const response = await axiosInstance.get<{
    success: boolean;
    categories: Category[];
  }>("/issues/categories");
  return response.data.categories;
};

export const createIssue = async (
  payload: CreateIssuePayload
): Promise<CreateIssueResponse> => {
  const response = await axiosInstance.post<CreateIssueResponse>(
    "/issues",
    payload
  );
  return response.data;
};

export const getIssueById = async (
  issueId: string
): Promise<IssueDetailsResponse> => {
  const response = await axiosInstance.get<IssueDetailsResponse>(
    `/issues/${issueId}`
  );
  return response.data;
};

export const getMyIssues = async (
  page = 1,
  pageSize = 10
): Promise<UserIssuesResponse> => {
  const response = await axiosInstance.get<UserIssuesResponse>(
    "/issues/my-issues",
    {
      params: { page, pageSize },
    }
  );
  return response.data;
};

export const getFeedIssues = async (
  params?: FeedIssuesParams
): Promise<FeedIssuesResponse> => {
  const response = await axiosInstance.get<FeedIssuesResponse>("/issues", {
    params,
  });
  return response.data;
};
