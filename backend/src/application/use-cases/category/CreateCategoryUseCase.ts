import type { Category } from "../../../domain/entities/Category.js";

import type { ICategoryRepository } from "../../../domain/interface/ICategoryRepository.js";

import { AppMessages } from "../../../shared/constants/messages.js";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

import ApiError from "../../../shared/utils/apiError.js";

import type { CategoryResponseDTO } from "../../dto/category/CategoryResponseDTO.js";

import type { CreateCategoryDTO } from "../../dto/category/CreateCategoryDTO.js";

import { CategoryMapper } from "../../mappers/CategoryMapper.js";

import type { ICreateCategoryUseCase } from "../usecase interfaces/category/ICreateCategoryUseCase.js";


export class CreateCategoryUseCase implements ICreateCategoryUseCase {
    constructor(
        private readonly categoryRepository: ICategoryRepository
    ) {}

    async execute(data: CreateCategoryDTO): Promise<CategoryResponseDTO> {

        const normalizedName = data.name.trim();

        const normalizedDescription = data.description.trim();

        const existingCategory = await this.categoryRepository.findByName(
            normalizedName
        );

        if(existingCategory) {
            throw new ApiError(HttpStatusCode.CONFLICT, AppMessages.ERROR.CATEGORY_ALREADY_EXISTS);
        }

        const category: Category = {
            name: normalizedName,
            description: normalizedDescription,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const createdCategory = await this.categoryRepository.create(category);

        return CategoryMapper.toResponse(createdCategory);

    }
}



