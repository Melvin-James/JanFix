import type { IIssueRepository, IssueFilters } from "../../../domain/interface/IIssueRepository.js";

import type { IStorageService } from "../../services/IStorageService.js";

import { refreshUploadedFileUrls } from "../../services/refreshUploadedFileUrls.js";

import type { IssueResponseDTO } from "../../dto/issue/IssueResponseDTO.js";

import type { IGetUserIssuesUseCase } from "../usecase interfaces/issue/IGetUserIssuesUseCase.js";

import type { PaginatedResult } from "../../../shared/types/Pagination.js";

import { IssueAppMapper } from "../../mappers/IssueAppMapper.js";

export class GetUserIssuesUseCase implements IGetUserIssuesUseCase {
    constructor(
        private readonly issueRepository: IIssueRepository,
        private readonly storageService: IStorageService
    ) {}

    async execute(
        userId: string,
        page = 1,
        pageSize = 10,
        filters?: IssueFilters
    ): Promise<PaginatedResult<IssueResponseDTO>> {
        const paginated = await this.issueRepository.findByUserId(userId, page, pageSize, filters);

        const items = await Promise.all(
            paginated.items.map(async (issue) => {
                const response = IssueAppMapper.toResponse(issue, {
                    includeRejectionReason: true,
                });
                
                return {
                    ...response,
                    images: await refreshUploadedFileUrls(
                        response.images, 
                        this.storageService
                    ),
                };
            })
        );

        return {
            items,
            pagination: paginated.pagination,
        };
    }
}
