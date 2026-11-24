import type { IIssueRepository, IssueFilters } from "../../../domain/interface/IIssueRepository.ts";

import type { IssueResponseDTO } from "../../dto/issue/IssueResponseDTO.ts";

import type { IStorageService } from "../../services/IStorageService.ts";

import { refreshUploadedFileUrls } from "../../services/refreshUploadedFileUrls.ts";

import type { IGetFeedIssuesUseCase } from "../usecase interfaces/issue/IGetFeedIssuesUseCase.ts";

import type { PaginatedResult } from "../../../shared/types/Pagination.ts";

import { IssueAppMapper } from "../../mappers/IssueAppMapper.ts";

export class GetFeedIssuesUseCase implements IGetFeedIssuesUseCase {

    constructor(

        private readonly _issueRepository: IIssueRepository,

        private readonly _storageService: IStorageService

    ) { }

    async execute(
        requestingUserId: string | undefined,
        page = 1,
        pageSize = 10,
        filters?: IssueFilters
    ): Promise<PaginatedResult<IssueResponseDTO>> {
        const paginated = await this._issueRepository.findFeedIssues(
            page,
            pageSize,
            filters,
            requestingUserId
        );

        const urlCache = new Map<string, string>();

        const items = await Promise.all(
            paginated.items.map(async (issue) => {
                const response = IssueAppMapper.toResponse(issue);
                return {
                    ...response,
                    images: await refreshUploadedFileUrls(
                        response.images,
                        this._storageService,
                        urlCache
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
