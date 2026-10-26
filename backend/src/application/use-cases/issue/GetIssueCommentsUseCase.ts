import { Types } from "mongoose";
import type { IIssueRepository } from "../../../domain/interface/IIssueRepository.js";
import type { IIssueCommentRepository } from "../../../domain/interface/IIssueCommentRepository.js";
import type { IssueCommentResponseDTO } from "../../dto/issue/IssueCommentResponseDTO.js";
import type { IGetIssueCommentsUseCase } from "../usecase interfaces/issue/IGetIssueCommentsUseCase.js";
import type { PaginatedResult } from "../../../shared/types/Pagination.js";
import ApiError from "../../../shared/utils/apiError.js";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";
import { IssueVisibility } from "../../../domain/enums/IssueVisibility.js";
import { IssueStatus } from "../../../domain/enums/IssueStatus.js";

export class GetIssueCommentsUseCase implements IGetIssueCommentsUseCase {
    constructor(
        private readonly issueRepository: IIssueRepository,
        private readonly issueCommentRepository: IIssueCommentRepository
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

        const issue = await this.issueRepository.findById(issueId);
        if (!issue) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, "Issue not found");
        }

        const isCreator = Boolean(userId && issue.createdBy === userId);

        // Enforce issue visibility rules
        const isApprovedPrivateIssue =
            issue.visibility === IssueVisibility.PRIVATE &&
            issue.status === IssueStatus.VERIFIED;

        if (isApprovedPrivateIssue && !isCreator) {
            throw new ApiError(HttpStatusCode.FORBIDDEN, "You do not have permission to view this private issue");
        }

        return await this.issueCommentRepository.findCommentsByIssueId(issueId, page, pageSize);
    }
}
export default GetIssueCommentsUseCase;
