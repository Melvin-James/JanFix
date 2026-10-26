import type { IIssueRepository, IssueFilters } from "../../../domain/interface/IIssueRepository.js";

import type { IssueResponseDTO } from "../../dto/issue/IssueResponseDTO.js";

import type { IStorageService } from "../../services/IStorageService.js";

import { refreshUploadedFileUrls } from "../../services/refreshUploadedFileUrls.js";

import type { IGetFeedIssuesUseCase } from "../usecase interfaces/issue/IGetFeedIssuesUseCase.js";

import type { PaginatedResult } from "../../../shared/types/Pagination.js";

import { IssueAppMapper } from "../../mappers/IssueAppMapper.js";

export class GetFeedIssuesUseCase implements IGetFeedIssuesUseCase {

    constructor(

        private readonly issueRepository: IIssueRepository,

        private readonly storageService: IStorageService

    ) { }

    async execute(
        requestingUserId: string | undefined,
        page = 1,
        pageSize = 10,
        filters?: IssueFilters
    ): Promise<PaginatedResult<IssueResponseDTO>> {
        const paginated = await this.issueRepository.findFeedIssues(
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
                        this.storageService,
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
