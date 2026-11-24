import type { IIssueRepository, IssueFilters } from "../../../domain/interface/IIssueRepository.ts";

import type { IStorageService } from "../../services/IStorageService.ts";

import { refreshUploadedFileUrls } from "../../services/refreshUploadedFileUrls.ts";

import type { IssueResponseDTO } from "../../dto/issue/IssueResponseDTO.ts";

import type { IGetUserIssuesUseCase } from "../usecase interfaces/issue/IGetUserIssuesUseCase.ts";

import type { PaginatedResult } from "../../../shared/types/Pagination.ts";

import { IssueAppMapper } from "../../mappers/IssueAppMapper.ts";

export class GetUserIssuesUseCase implements IGetUserIssuesUseCase {
    constructor(
        private readonly _issueRepository: IIssueRepository,
        private readonly _storageService: IStorageService
    ) {}

    async execute(
        userId: string,
        page = 1,
        pageSize = 10,
        filters?: IssueFilters
    ): Promise<PaginatedResult<IssueResponseDTO>> {
        const paginated = await this._issueRepository.findByUserId(userId, page, pageSize, filters);

        const items = await Promise.all(
            paginated.items.map(async (issue) => {
                const response = IssueAppMapper.toResponse(issue, {
                    includeRejectionReason: true,
                });
                
                return {
                    ...response,
                    images: await refreshUploadedFileUrls(
                        response.images, 
                        this._storageService
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
