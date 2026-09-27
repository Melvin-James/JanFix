import type { ICategoryRepository } from "../../../domain/interface/ICategoryRepository.js";
import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";
import { AppMessages } from "../../../shared/constants/messages.js";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";
import ApiError from "../../../shared/utils/apiError.js";
import type { IDeleteCategoryUseCase } from "../usecase interfaces/category/IDeleteCategoryUseCase.js";

export class DeleteCategoryUseCase implements IDeleteCategoryUseCase {
    constructor(
        private readonly categoryRepository: ICategoryRepository,
        private readonly userRepository: IUserRepository
    ) {}

    async execute(categoryId: string): Promise<void> {
        const existingCategory = await this.categoryRepository.findById(categoryId);

        if (!existingCategory) {
            throw new ApiError(
                HttpStatusCode.NOT_FOUND,
                AppMessages.ERROR.CATEGORY_NOT_FOUND
            );
        }

        const isInUse = await this.userRepository.isCategoryInUse(
            existingCategory.name,
            existingCategory.id
        );

        if (isInUse) {
            throw new ApiError(
                HttpStatusCode.CONFLICT,
                AppMessages.ERROR.CATEGORY_IN_USE
            );
        }

        const isDeleted = await this.categoryRepository.delete(categoryId);

        if (!isDeleted) {
            throw new ApiError(
                HttpStatusCode.NOT_FOUND,
                AppMessages.ERROR.CATEGORY_NOT_FOUND
            );
        }
    }
}
