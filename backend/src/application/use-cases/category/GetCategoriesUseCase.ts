import type { ICategoryRepository, CategoryFilters } from "../../../domain/interface/ICategoryRepository.ts";

import type { CategoryResponseDTO } from "../../dto/category/CategoryResponseDTO.ts";

import { CategoryMapper } from "../../mappers/CategoryMapper.ts";

import type { IGetCategoriesUseCase } from "../usecase interfaces/category/IGetCategoriesUseCase.ts";
import type { PaginatedResult } from "../../../shared/types/Pagination.ts";

export class GetCategoriesUseCase implements IGetCategoriesUseCase {

    constructor(

        private readonly _categoryRepository: ICategoryRepository

    ) {}

    async execute(
        page?: number,
        pageSize?: number,
        filters?: CategoryFilters
    ): Promise<PaginatedResult<CategoryResponseDTO> | CategoryResponseDTO[]> {
        if (page !== undefined && pageSize !== undefined) {
            const paginatedResult = await this._categoryRepository.findPaginated(
                page,
                pageSize,
                filters
            );

            return {
                items: paginatedResult.items.map(CategoryMapper.toResponse),
                pagination: paginatedResult.pagination,
            };
        }

        const categories = await this._categoryRepository.findAll();
        return categories.map(CategoryMapper.toResponse);
    }
    
}