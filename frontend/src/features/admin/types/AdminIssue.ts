import type { UploadedFile } from "../../provider/types/uploadedFile";
import type { IssueLocation, IssueVisibility, IssueStatus } from "../../issues/types/issue";

export interface AdminIssueCategory {
  id: string;
  name: string;
}

export interface AdminIssueReporter {
  id: string;
  fullName: string;
  email?: string;
}

export interface AdminIssueListItem {
  id: string;
  title: string;
  description: string;
  category: AdminIssueCategory;
  reporter: AdminIssueReporter;
  images: UploadedFile[];
  visibility: IssueVisibility;
  location: IssueLocation;
  status: IssueStatus;
  rejectionReason?: string;
  upvoteCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GetAdminIssuesParams {
  page: number;
  pageSize: number;
  search?: string;
  category?: string;
  status?: string;
  visibility?: string;
}

export interface ApproveIssueResponse {
  success: boolean;
  message: string;
  issue: import("../../issues/types/issue").Issue;
}

export interface RejectIssueResponse {
  success: boolean;
  message: string;
  issue: import("../../issues/types/issue").Issue;
}
