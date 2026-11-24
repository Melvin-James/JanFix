import type { CreateCategoryDTO } from "../../../dto/category/CreateCategoryDTO.ts";

import type { CategoryResponseDTO } from "../../../dto/category/CategoryResponseDTO.ts";

export interface ICreateCategoryUseCase {

    execute(data: CreateCategoryDTO): Promise<CategoryResponseDTO>;

}