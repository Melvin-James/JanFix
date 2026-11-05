export const ProviderType = {
    INDIVIDUAL: "INDIVIDUAL",
    VOLUNTEER_GROUP: "VOLUNTEER_GROUP",
    NGO: "NGO",
} as const;

export type ProviderType = typeof ProviderType[keyof typeof ProviderType];

import type { Issue, IssueLocation, IssueStatus, IssueVisibility } from "../../issues/types/issue";
import type { UploadedFile } from "./uploadedFile";

export interface ProviderIssue {
  id: string;
  title: string;
  description: string;
  category: {
    id: string;
    name: string;
  };
  location: IssueLocation;
  images: UploadedFile[];
  visibility: IssueVisibility;
  status: IssueStatus;
  hasExpressedInterest: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProviderIssuesResponse {
  success: boolean;
  issues: ProviderIssue[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface ProviderIssueDetail extends Issue {
  hasExpressedInterest: boolean;
}

export interface ProviderIssueDetailsResponse {
  success: boolean;
  issue: ProviderIssueDetail;
}
