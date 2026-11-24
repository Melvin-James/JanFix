import type { ICategoryRepository } from "../../../domain/interface/ICategoryRepository.ts";

import { AppMessages } from "../../../shared/constants/messages.ts";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.ts";

import ApiError from "../../../shared/utils/apiError.ts";

import type { CategoryResponseDTO } from "../../dto/category/CategoryResponseDTO.ts";

import type { UpdateCategoryDTO } from "../../dto/category/UpdateCategoryDTO.ts";

import { CategoryMapper } from "../../mappers/CategoryMapper.ts";

import type { IUpdateCategoryUseCase } from "../usecase interfaces/category/IUpdateCategoryUseCase.ts";

export class UpdateCategoryUseCase implements IUpdateCategoryUseCase {
    constructor(
        private readonly _categoryRepository: ICategoryRepository
    ) { }

    async execute(
        categoryId: string,
        data: UpdateCategoryDTO
    ): Promise<CategoryResponseDTO> {

        const existingCategory = await this._categoryRepository.findById(
            categoryId
        );

        if (!existingCategory) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, AppMessages.ERROR.CATEGORY_NOT_FOUND);
        }

        const categoryWithSameName = await this._categoryRepository.findByName(data.name);

        if (categoryWithSameName && categoryWithSameName.id !== existingCategory.id) {
            throw new ApiError(
                HttpStatusCode.CONFLICT,
                AppMessages.ERROR.CATEGORY_ALREADY_EXISTS
            );
        }

        const updatedCategory = await this._categoryRepository.update(
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