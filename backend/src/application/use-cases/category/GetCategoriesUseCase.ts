import type { ICategoryRepository } from "../../../domain/interface/ICategoryRepository.js";

import type { CategoryResponseDTO } from "../../dto/category/CategoryResponseDTO.js";

import { CategoryMapper } from "../../mappers/CategoryMapper.js";

import type { IGetCategoriesUseCase } from "../usecase interfaces/category/IGetCategoriesUseCase.js";

export class GetCategoriesUseCase implements IGetCategoriesUseCase {

    constructor(

        private readonly categoryRepository: ICategoryRepository

    ) {}

    async execute(): Promise<CategoryResponseDTO[]> {

        const categories = await this.categoryRepository.findAll();

        return categories.map(CategoryMapper.toResponse);

    }
    
}