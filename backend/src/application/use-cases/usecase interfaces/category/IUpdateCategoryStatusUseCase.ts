import type { CategoryResponseDTO } from "../../../dto/category/CategoryResponseDTO.ts";

export interface IUpdateCategoryStatusUseCase {
    execute(
        categoryId: string,
        isActive: boolean
    ): Promise<CategoryResponseDTO>;
}
