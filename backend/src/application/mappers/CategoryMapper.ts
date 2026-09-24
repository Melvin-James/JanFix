import type { Category } from "../../domain/entities/Category.js";

import type { CategoryResponseDTO } from "../dto/category/CategoryResponseDTO.js";

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