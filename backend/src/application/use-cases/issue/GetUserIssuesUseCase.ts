import type { IIssueRepository } from "../../../domain/interface/IIssueRepository.js";
import type { IssueResponseDTO } from "../../dto/issue/IssueResponseDTO.js";
import type { IGetUserIssuesUseCase } from "../usecase interfaces/issue/IGetUserIssuesUseCase.js";
import type { PaginatedResult } from "../../../shared/types/Pagination.js";
import { IssueAppMapper } from "../../mappers/IssueAppMapper.js";

export class GetUserIssuesUseCase implements IGetUserIssuesUseCase {
    constructor(private readonly issueRepository: IIssueRepository) {}

    async execute(
        userId: string,
        page = 1,
        pageSize = 10
    ): Promise<PaginatedResult<IssueResponseDTO>> {
        const paginated = await this.issueRepository.findByUserId(userId, page, pageSize);

        return {
            items: paginated.items.map(IssueAppMapper.toResponse),
            pagination: paginated.pagination,
        };
    }
}
