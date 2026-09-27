import axiosInstance from "../../../api/axios";
import type {
  Category,
  CategoriesListResponse,
  CategoryResponse,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  DeleteCategoryResponse,
} from "../types/Category";

export const getCategories = async (): Promise<Category[]> => {
  const response = await axiosInstance.get<CategoriesListResponse>(
    "/admin/categories"
  );
  return response.data.categories;
};

export const createCategory = async (
  payload: CreateCategoryPayload
): Promise<Category> => {
  const response = await axiosInstance.post<CategoryResponse>(
    "/admin/categories",
    payload
  );
  return response.data.category;
};

export const updateCategory = async (
  categoryId: string,
  payload: UpdateCategoryPayload
): Promise<Category> => {
  const response = await axiosInstance.patch<CategoryResponse>(
    `/admin/categories/${categoryId}`,
    payload
  );
  return response.data.category;
};

export const updateCategoryStatus = async (
  categoryId: string,
  isActive: boolean
): Promise<Category> => {
  const response = await axiosInstance.patch<CategoryResponse>(
    `/admin/categories/${categoryId}/status`,
    { isActive }
  );
  return response.data.category;
};

export const blockCategory = async (categoryId: string): Promise<Category> => {
  const response = await axiosInstance.patch<CategoryResponse>(
    `/admin/categories/${categoryId}/block`
  );
  return response.data.category;
};

export const unblockCategory = async (categoryId: string): Promise<Category> => {
  const response = await axiosInstance.patch<CategoryResponse>(
    `/admin/categories/${categoryId}/unblock`
  );
  return response.data.category;
};

export const deleteCategory = async (categoryId: string): Promise<DeleteCategoryResponse> => {
  const response = await axiosInstance.delete<DeleteCategoryResponse>(
    `/admin/categories/${categoryId}`
  );
  return response.data;
};



