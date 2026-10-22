import type { UploadedFile } from "../../provider/types/uploadedFile";

export type IssueVisibility = "PUBLIC" | "PRIVATE";

export type IssueStatus = "REPORTED" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface IssueLocation {
  address: string;
  coordinates: Coordinates;
  locality?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

export interface Issue {
  id: string;
  createdBy: string;
  title: string;
  description: string;
  category: string;
  images: UploadedFile[];
  visibility: IssueVisibility;
  location: IssueLocation;
  status: IssueStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateIssuePayload {
  title: string;
  description: string;
  categoryId: string;
  images: UploadedFile[];
  visibility: IssueVisibility;
  location: IssueLocation;
}

export interface CreateIssueResponse {
  success: boolean;
  message: string;
  issue: Issue;
}

export interface IssueDetailsResponse {
  success: boolean;
  issue: Issue;
}

export interface UserIssuesResponse {
  success: boolean;
  issues: Issue[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}
