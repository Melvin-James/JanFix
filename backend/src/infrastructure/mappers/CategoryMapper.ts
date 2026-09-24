import type { Category } from "../../domain/entities/Category.js";

import type { CategoryDocument } from "../models/CategoryModel.js";

export class CategoryMapper {
    static toEntity(document: CategoryDocument): Category {
        return {
            id: document._id.toString(),
            name: document.name,
            description: document.description,
            isActive: document.isActive,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
        };
    }
}