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

        const safePage = Number.isInteger(page) && page > 0 ? page : 1;

        const safePageSize = Number.isInteger(pageSize) && pageSize > 0
            ? Math.min(pageSize, 100)
            : 10;

        const query: CategoryFilter = {};

        if (filters?.status && filters.status !== "ALL") {
            query.isActive = filters.status === "ACTIVE";
        }

        if (filters?.search && filters.search.trim() !== "") {

            const escapedSearch = filters.search.trim().replace( /[.*+?^${}()|[\]\\]/g,"\\$&");

            const searchRegex = new RegExp(escapedSearch, "i");

            query.$or = [{ name: searchRegex }, { description: searchRegex }];
        }

        const totalItems = await CategoryModel.countDocuments(query);

        const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));

        const skip = (safePage - 1) * safePageSize;

        const docs = await CategoryModel.find(query).sort({createdAt: -1, _id:-1}).skip(skip).limit(safePageSize);

        return {
            items: docs.map(CategoryMapper.toEntity),
            pagination: {
                page: safePage,
                pageSize: safePageSize,
                totalItems,
                totalPages,
            },
        };
    }
}
