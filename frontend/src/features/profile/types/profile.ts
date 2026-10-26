import type { Issue } from "../../issues/types/issue";

export interface PaginationMetadata {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateProfilePayload {
  fullName: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      fullName: string;
      email: string;
      roles: string[];
      isVerified: boolean;
      accountStatus?: string;
    };
  };
}

export interface ReportFilterParams {
  page?: number;
  pageSize?: number;
  status?: string;
  visibility?: string;
  category?: string;
  search?: string;
}

export interface UserReportsResponse {
  success: boolean;
  issues: Issue[];
  pagination: PaginationMetadata;
}
