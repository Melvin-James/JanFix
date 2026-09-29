import type { ICategoryRepository, CategoryFilters } from "../../../domain/interface/ICategoryRepository.js";

import type { CategoryResponseDTO } from "../../dto/category/CategoryResponseDTO.js";

import { CategoryMapper } from "../../mappers/CategoryMapper.js";

import type { IGetCategoriesUseCase } from "../usecase interfaces/category/IGetCategoriesUseCase.js";
import type { PaginatedResult } from "../../../shared/types/Pagination.js";

export class GetCategoriesUseCase implements IGetCategoriesUseCase {

    constructor(

        private readonly categoryRepository: ICategoryRepository

    ) {}

    async execute(
        page?: number,
        pageSize?: number,
        filters?: CategoryFilters
    ): Promise<PaginatedResult<CategoryResponseDTO> | CategoryResponseDTO[]> {
        if (page !== undefined && pageSize !== undefined) {
            const paginatedResult = await this.categoryRepository.findPaginated(
                page,
                pageSize,
                filters
            );

            return {
                items: paginatedResult.items.map(CategoryMapper.toResponse),
                pagination: paginatedResult.pagination,
            };
        }

        const categories = await this.categoryRepository.findAll();
        return categories.map(CategoryMapper.toResponse);
    }
    
}