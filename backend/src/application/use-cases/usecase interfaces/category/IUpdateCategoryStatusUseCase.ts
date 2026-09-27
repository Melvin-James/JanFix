import type { CategoryResponseDTO } from "../../../dto/category/CategoryResponseDTO.js";

export interface IUpdateCategoryStatusUseCase {
    execute(
        categoryId: string,
        isActive: boolean
    ): Promise<CategoryResponseDTO>;
}
