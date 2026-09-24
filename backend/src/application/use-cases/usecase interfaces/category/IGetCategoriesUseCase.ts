import type { CategoryResponseDTO } from "../../../dto/category/CategoryResponseDTO.js";

export interface IGetCategoriesUseCase {

    execute(): Promise<CategoryResponseDTO[]>;

}