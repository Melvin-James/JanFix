import type { Category } from "../../domain/entities/Category.ts";

import type { CategoryResponseDTO } from "../dto/category/CategoryResponseDTO.ts";

export class CategoryMapper {
    static toResponse(category: Category): CategoryResponseDTO {
        return {
            id: category.id as string,
            name: category.name,
            description: category.description,
            isActive: category.isActive,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
        };
    }
}