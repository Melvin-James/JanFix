import axiosInstance from "../../../api/axios";
import type {
  UpdateProfilePayload,
  UpdateProfileResponse,
  ReportFilterParams,
  UserReportsResponse,
  CategoryItem,
} from "../types/profile";

export const updateProfile = async (
  payload: UpdateProfilePayload
): Promise<UpdateProfileResponse> => {
  const response = await axiosInstance.patch<UpdateProfileResponse>(
    "/auth/profile",
    payload
  );
  return response.data;
};

export const getMyReports = async (
  params?: ReportFilterParams
): Promise<UserReportsResponse> => {
  const response = await axiosInstance.get<UserReportsResponse>(
    "/issues/my-issues",
    {
      params,
    }
  );
  return response.data;
};

export const getIssueCategories = async (): Promise<CategoryItem[]> => {
  const response = await axiosInstance.get<{
    success: boolean;
    categories: CategoryItem[];
  }>("/issues/categories");
  return response.data.categories;
};
