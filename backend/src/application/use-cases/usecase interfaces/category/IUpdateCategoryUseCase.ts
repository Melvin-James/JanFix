import type { StringValidation } from "zod/v3";
import type { CategoryResponseDTO } from "../../../dto/category/CategoryResponseDTO.js";

import type { UpdateCategoryDTO } from "../../../dto/category/UpdateCategoryDTO.js";

export interface IUpdateCategoryUseCase {
    execute(
        categoryId: string,
        data: UpdateCategoryDTO
    ): Promise<CategoryResponseDTO>
}