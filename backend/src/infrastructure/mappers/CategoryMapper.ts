import type { Document } from "mongoose";

import type { Category } from "../../domain/entities/Category.js";

import type { CategoryDocument } from "../models/CategoryModel.js";

export class CategoryMapper {
    static toEntity(doc: Document): Category {
        const document = doc as CategoryDocument;
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