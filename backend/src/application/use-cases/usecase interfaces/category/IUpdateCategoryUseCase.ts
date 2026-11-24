import type { CategoryResponseDTO } from "../../../dto/category/CategoryResponseDTO.ts";

import type { UpdateCategoryDTO } from "../../../dto/category/UpdateCategoryDTO.ts";

export interface IUpdateCategoryUseCase {
    execute(
        categoryId: string,
        data: UpdateCategoryDTO
    ): Promise<CategoryResponseDTO>
}