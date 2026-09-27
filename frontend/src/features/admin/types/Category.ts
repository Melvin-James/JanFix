export interface Category {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryPayload {
  name: string;
  description: string;
}

export interface UpdateCategoryPayload {
  name: string;
  description: string;
}

export interface CategoryResponse {
  success: boolean;
  category: Category;
}

export interface CategoriesListResponse {
  success: boolean;
  categories: Category[];
}

export interface DeleteCategoryResponse {
  success: boolean;
  message: string;
}
