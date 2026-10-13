import axiosInstance from "../../../api/axios";

import type { Category, CategoriesListResponse, CategoryResponse, CreateCategoryPayload, UpdateCategoryPayload, } from "../types/Category";

import type { GetCategoriesParams, PaginatedResponse } from "../types/Pagination";

export function getCategories(): Promise<Category[]>;

export function getCategories(
  params: GetCategoriesParams
): Promise<PaginatedResponse<Category>>;

export async function getCategories(
  params?: GetCategoriesParams
): Promise<Category[] | PaginatedResponse<Category>> {
  if(params) {
    const response = await axiosInstance.get<{
      success: boolean;
      categories: Category[];
      pagination: PaginatedResponse<Category>["pagination"];
    }>("/admin/categories", {params});

    return {
      items: response.data.categories,
      pagination: response.data.pagination,
    };
  }

  const response = await axiosInstance.get<CategoriesListResponse>(
    "/admin/categories"
  );

  return response.data.categories;
}

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