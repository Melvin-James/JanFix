import type { Category } from "../../../domain/entities/Category.ts";

import type { ICategoryRepository } from "../../../domain/interface/ICategoryRepository.ts";

import { AppMessages } from "../../../shared/constants/messages.ts";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.ts";

import ApiError from "../../../shared/utils/apiError.ts";

import type { CategoryResponseDTO } from "../../dto/category/CategoryResponseDTO.ts";

import type { CreateCategoryDTO } from "../../dto/category/CreateCategoryDTO.ts";

import { CategoryMapper } from "../../mappers/CategoryMapper.ts";

import type { ICreateCategoryUseCase } from "../usecase interfaces/category/ICreateCategoryUseCase.ts";


export class CreateCategoryUseCase implements ICreateCategoryUseCase {
    constructor(
        private readonly _categoryRepository: ICategoryRepository
    ) {}

    async execute(data: CreateCategoryDTO): Promise<CategoryResponseDTO> {

        const normalizedName = data.name.trim();

        const normalizedDescription = data.description.trim();

        const existingCategory = await this._categoryRepository.findByName(
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

        const createdCategory = await this._categoryRepository.create(category);

        return CategoryMapper.toResponse(createdCategory);

    }
}



