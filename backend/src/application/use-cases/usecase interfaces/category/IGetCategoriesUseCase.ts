import type { CategoryResponseDTO } from "../../../dto/category/CategoryResponseDTO.ts";
import type { PaginatedResult } from "../../../../shared/types/Pagination.ts";
import type { CategoryFilters } from "../../../../domain/interface/ICategoryRepository.ts";

export interface IGetCategoriesUseCase {

    execute(
        page?: number,
        pageSize?: number,
        filters?: CategoryFilters
    ): Promise<PaginatedResult<CategoryResponseDTO> | CategoryResponseDTO[]>;

}