import type { ICategoryRepository } from "../../domain/interface/ICategoryRepository.js";

import type { Category } from "../../domain/entities/Category.js";

import { CategoryModel } from "../models/CategoryModel.js";

import { BaseRepository } from "./base/BaseRepository.js";

import { CategoryMapper } from "../mappers/CategoryMapper.js";

export class CategoryRepository extends BaseRepository<Category> implements ICategoryRepository {
    constructor() {
        super(
            CategoryModel,
            CategoryMapper.toEntity
        );
    }

    async findByName(name: string): Promise<Category | null> {

        const category = await CategoryModel.findOne({name});
        
        if(!category) {
            return null;
        }

        return CategoryMapper.toEntity(category);
    }

    async findAll(): Promise<Category[]> {
        
        const categories = await CategoryModel.find();

        return categories.map(CategoryMapper.toEntity);
    }
}