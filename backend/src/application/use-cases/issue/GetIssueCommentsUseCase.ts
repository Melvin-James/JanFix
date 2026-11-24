import { Types } from "mongoose";
import type { IIssueRepository } from "../../../domain/interface/IIssueRepository.ts";
import type { IIssueCommentRepository } from "../../../domain/interface/IIssueCommentRepository.ts";
import type { IssueCommentResponseDTO } from "../../dto/issue/IssueCommentResponseDTO.ts";
import type { IGetIssueCommentsUseCase } from "../usecase interfaces/issue/IGetIssueCommentsUseCase.ts";
import type { PaginatedResult } from "../../../shared/types/Pagination.ts";
import ApiError from "../../../shared/utils/apiError.ts";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.ts";

export class GetIssueCommentsUseCase implements IGetIssueCommentsUseCase {
    constructor(
        private readonly _issueRepository: IIssueRepository,
        private readonly _issueCommentRepository: IIssueCommentRepository
    ) {}

    async execute(
        issueId: string,
        userId?: string,
        page = 1,
        pageSize = 20
    ): Promise<PaginatedResult<IssueCommentResponseDTO>> {
        if (!Types.ObjectId.isValid(issueId)) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "Invalid issue ID format");
        }

        const issue = await this._issueRepository.findById(issueId);

        if (!issue) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, "Issue not found");
        }        

        return await this._issueCommentRepository.findCommentsByIssueId(issueId, page, pageSize);
    }
}
export default GetIssueCommentsUseCase;
