import type { ICategoryRepository } from "../../../domain/interface/ICategoryRepository.js";

import { AppMessages } from "../../../shared/constants/messages.js";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

import ApiError from "../../../shared/utils/apiError.js";

import type { CategoryResponseDTO } from "../../dto/category/CategoryResponseDTO.js";

import type { UpdateCategoryDTO } from "../../dto/category/UpdateCategoryDTO.js";

import { CategoryMapper } from "../../mappers/CategoryMapper.js";

import type { IUpdateCategoryUseCase } from "../usecase interfaces/category/IUpdateCategoryUseCase.js";

export class UpdateCategoryUseCase implements IUpdateCategoryUseCase {
    constructor(
        private readonly categoryRepository: ICategoryRepository
    ) { }

    async execute(
        categoryId: string,
        data: UpdateCategoryDTO
    ): Promise<CategoryResponseDTO> {

        const existingCategory = await this.categoryRepository.findById(
            categoryId
        );

        if (!existingCategory) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, AppMessages.ERROR.CATEGORY_NOT_FOUND);
        }

        const categoryWithSameName = await this.categoryRepository.findByName(data.name);

        if (categoryWithSameName && categoryWithSameName.id !== existingCategory.id) {
            throw new ApiError(
                HttpStatusCode.CONFLICT,
                AppMessages.ERROR.CATEGORY_ALREADY_EXISTS
            );
        }

        const updatedCategory = await this.categoryRepository.update(
            categoryId,
            {
                name: data.name,
                description: data.description,
            }
        );

        if (!updatedCategory) {
            throw new ApiError(
                HttpStatusCode.NOT_FOUND,
                AppMessages.ERROR.CATEGORY_NOT_FOUND
            );
        }

        return CategoryMapper.toResponse(updatedCategory);

    }
}