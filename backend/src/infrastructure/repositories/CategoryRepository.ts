import type { QueryFilter } from "mongoose";

import type { ICategoryRepository } from "../../domain/interface/ICategoryRepository.js";

import type { Category } from "../../domain/entities/Category.js";

import { CategoryModel, type CategoryDocument } from "../models/CategoryModel.js";

import { BaseRepository } from "./base/BaseRepository.js";

import { CategoryMapper } from "../mappers/CategoryMapper.js";

type CategoryFilter = QueryFilter<CategoryDocument>;

export class CategoryRepository extends BaseRepository<Category> implements ICategoryRepository {
    constructor() {
        super(
            CategoryModel,
            CategoryMapper.toEntity
        );
    }

    async findByName(name: string): Promise<Category | null> {

        const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        const category = await CategoryModel.findOne({name:{$regex: `^${escapedName}$`, $options: "i",},});
        
        if(!category) {
            return null;
        }

        return CategoryMapper.toEntity(category);
    }

    async findAll(): Promise<Category[]> {
        
        const categories = await CategoryModel.find();

        return categories.map(CategoryMapper.toEntity);
    }

    async findPaginated(
        page: number,
        pageSize: number,
        filters?: { search?: string; status?: string }
    ) {
        const query: CategoryFilter = {};

        if (filters?.status && filters.status !== "ALL") {
            query.isActive = filters.status === "ACTIVE";
        }

        if (filters?.search && filters.search.trim() !== "") {
            const searchRegex = new RegExp(filters.search.trim(), "i");
            query.$or = [{ name: searchRegex }, { description: searchRegex }];
        }

        const totalItems = await CategoryModel.countDocuments(query);
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
        const skip = (page - 1) * pageSize;

        const docs = await CategoryModel.find(query).skip(skip).limit(pageSize);

        return {
            items: docs.map(CategoryMapper.toEntity),
            pagination: {
                page,
                pageSize,
                totalItems,
                totalPages,
            },
        };
    }
}
