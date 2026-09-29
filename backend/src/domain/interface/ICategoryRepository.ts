import type { Category } from "../entities/Category.js";
import type { PaginatedResult } from "../../shared/types/Pagination.js";

export interface CategoryFilters {
    search?: string | undefined;
    status?: string | undefined;
}


export interface ICategoryRepository {

    findById(id: string): Promise<Category | null>;

    findByName(name: string): Promise<Category |null>;

    findAll(): Promise<Category[]>;

    findPaginated(
        page: number,
        pageSize: number,
        filters?: CategoryFilters
    ): Promise<PaginatedResult<Category>>;

    create(category: Category): Promise<Category>;

    update(id: string, data: Partial<Category>): Promise<Category | null>;

    delete(id: string): Promise<boolean>;

}