import type { ICategoryRepository } from "../../../domain/interface/ICategoryRepository.ts";

import { AppMessages } from "../../../shared/constants/messages.ts";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.ts";

import ApiError from "../../../shared/utils/apiError.ts";

import type { CategoryResponseDTO } from "../../dto/category/CategoryResponseDTO.ts";

import { CategoryMapper } from "../../mappers/CategoryMapper.ts";

import type { IUpdateCategoryStatusUseCase } from "../usecase interfaces/category/IUpdateCategoryStatusUseCase.ts";

export class UpdateCategoryStatusUseCase implements IUpdateCategoryStatusUseCase {
    constructor(
        private readonly _categoryRepository: ICategoryRepository
    ) { }

    async execute(
        categoryId: string,
        isActive: boolean
    ): Promise<CategoryResponseDTO> {
        const existingCategory = await this._categoryRepository.findById(
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

        const updatedCategory = await this._categoryRepository.update(
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
