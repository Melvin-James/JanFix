import type { ICategoryRepository } from "../../../domain/interface/ICategoryRepository.js";

import { AppMessages } from "../../../shared/constants/messages.js";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

import ApiError from "../../../shared/utils/apiError.js";

import type { CategoryResponseDTO } from "../../dto/category/CategoryResponseDTO.js";

import { CategoryMapper } from "../../mappers/CategoryMapper.js";

import type { IUpdateCategoryStatusUseCase } from "../usecase interfaces/category/IUpdateCategoryStatusUseCase.js";

export class UpdateCategoryStatusUseCase implements IUpdateCategoryStatusUseCase {
    constructor(
        private readonly categoryRepository: ICategoryRepository
    ) { }

    async execute(
        categoryId: string,
        isActive: boolean
    ): Promise<CategoryResponseDTO> {
        const existingCategory = await this.categoryRepository.findById(
            categoryId
        );

        if (!existingCategory) {
            throw new ApiError(
                HttpStatusCode.NOT_FOUND,
                AppMessages.ERROR.CATEGORY_NOT_FOUND
            );
        }

        if (existingCategory.isActive === isActive) {
            return CategoryMapper.toResponse(existingCategory);
        }

        const updatedCategory = await this.categoryRepository.update(
            categoryId,
            {
                isActive,
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
