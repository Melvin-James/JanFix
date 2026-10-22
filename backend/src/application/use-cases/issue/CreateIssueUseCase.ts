import type { IIssueRepository } from "../../../domain/interface/IIssueRepository.js";
import type { ICategoryRepository } from "../../../domain/interface/ICategoryRepository.js";
import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";
import type { CreateIssueDTO } from "../../dto/issue/CreateIssueDTO.js";
import type { IssueResponseDTO } from "../../dto/issue/IssueResponseDTO.js";
import type { ICreateIssueUseCase } from "../usecase interfaces/issue/ICreateIssueUseCase.js";
import { IssueStatus } from "../../../domain/enums/IssueStatus.js";
import { IssueVisibility } from "../../../domain/enums/IssueVisibility.js";
import { IssueAppMapper } from "../../mappers/IssueAppMapper.js";
import ApiError from "../../../shared/utils/apiError.js";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";
import { AppMessages } from "../../../shared/constants/messages.js";
import { AccountStatus } from "../../../domain/enums/AccountStatus.js";

export class CreateIssueUseCase implements ICreateIssueUseCase {
    constructor(
        private readonly issueRepository: IIssueRepository,
        private readonly categoryRepository: ICategoryRepository,
        private readonly userRepository: IUserRepository
    ) { }

    async execute(dto: CreateIssueDTO): Promise<IssueResponseDTO> {
        // 1. Verify User exists and is active
        const user = await this.userRepository.findById(dto.createdBy);
        if (!user) {
            throw new ApiError(HttpStatusCode.UNAUTHORIZED, AppMessages.ERROR.USER_NOT_FOUND);
        }

        if (user.accountStatus === AccountStatus.BLOCKED) {
            throw new ApiError(HttpStatusCode.FORBIDDEN, AppMessages.ERROR.ACCOUNT_BLOCKED);
        }

        // 2. Verify Category exists and is active
        const category = await this.categoryRepository.findById(dto.categoryId);
        if (!category) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, AppMessages.ERROR.CATEGORY_NOT_FOUND);
        }

        if (!category.isActive) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, AppMessages.ERROR.SELECTED_CATEGORY_INACTIVE);
        }

        // 3. Validate Images (max 5, size limits, allowed types, valid upload folder key prefix)
        if (!dto.images || !Array.isArray(dto.images)) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, AppMessages.ERROR.IMAGES_ARRAY_REQUIRED);
        }

        if (dto.images.length > 5) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, AppMessages.ERROR.MAX_IMAGE_LIMIT);
        }

        const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
        const maxFileSize = 5 * 1024 * 1024; // 5 MB

        for (const img of dto.images) {
            if (!img.key || !img.url || !img.originalName || !img.mimeType || !img.size) {
                throw new ApiError(HttpStatusCode.BAD_REQUEST, AppMessages.ERROR.INVALID_IMAGE_METADATA);
            }

            if (!allowedMimeTypes.includes(img.mimeType)) {
                throw new ApiError(HttpStatusCode.BAD_REQUEST, AppMessages.ERROR.UNSUPPORTED_IMAGE_FORMAT);
            }

            if (img.size > maxFileSize) {
                throw new ApiError(HttpStatusCode.BAD_REQUEST, AppMessages.ERROR.IMAGE_SIZE_LIMIT_EXCEEDED);
            }

            // Ensure image belongs to authorized upload flow for issues
            if (!img.key.startsWith("issues/images/")) {
                throw new ApiError(HttpStatusCode.BAD_REQUEST, AppMessages.ERROR.UNAUTHORIZED_UPLOAD_KEY_PREFIX);
            }
        }

        // 4. Validate Location & Coordinates
        if (!dto.location || !dto.location.address || !dto.location.coordinates) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, AppMessages.ERROR.LOCATION_INFORMATION_REQUIRED);
        }

        const { latitude, longitude } = dto.location.coordinates;
        if (
            typeof latitude !== "number" ||
            typeof longitude !== "number" ||
            Number.isNaN(latitude) ||
            Number.isNaN(longitude) ||
            latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180
        ) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, AppMessages.ERROR.INVALID_COORDINATES);
        }

        // 5. Visibility validation
        if (
            dto.visibility !== IssueVisibility.PUBLIC &&
            dto.visibility !== IssueVisibility.PRIVATE
        ) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, AppMessages.ERROR.ISSUE_VISIBILITY_REQUIRED);
        }

        const visibility = dto.visibility;

        // 6. Build issue with server-controlled initial status REPORTED
        const createdIssue = await this.issueRepository.create({
            createdBy: dto.createdBy,
            title: dto.title.trim(),
            description: dto.description.trim(),
            category: dto.categoryId,
            images: dto.images,
            visibility,
            location: {
                address: dto.location.address.trim(),
                coordinates: {
                    latitude,
                    longitude,
                },
                locality: dto.location.locality?.trim(),
                city: dto.location.city?.trim() || "Kochi",
                state: dto.location.state?.trim() || "Kerala",
                postalCode: dto.location.postalCode?.trim(),
            },
            status: IssueStatus.REPORTED, // strictly enforced server-side
        });

        return IssueAppMapper.toResponse(createdIssue);
    }
}
