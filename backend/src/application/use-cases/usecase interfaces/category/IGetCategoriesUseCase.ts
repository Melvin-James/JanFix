import type { CategoryResponseDTO } from "../../../dto/category/CategoryResponseDTO.js";
import type { PaginatedResult } from "../../../../shared/types/Pagination.js";
import type { CategoryFilters } from "../../../../domain/interface/ICategoryRepository.js";

export interface IGetCategoriesUseCase {

    execute(
        page?: number,
        pageSize?: number,
        filters?: CategoryFilters
    ): Promise<PaginatedResult<CategoryResponseDTO> | CategoryResponseDTO[]>;

}