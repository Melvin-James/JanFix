import type { CreateCategoryDTO } from "../../../dto/category/CreateCategoryDTO.js";

import type { CategoryResponseDTO } from "../../../dto/category/CategoryResponseDTO.js";

export interface ICreateCategoryUseCase {

    execute(data: CreateCategoryDTO): Promise<CategoryResponseDTO>;

}