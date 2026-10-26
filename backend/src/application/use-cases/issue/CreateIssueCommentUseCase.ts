import { Types } from "mongoose";
import type { IIssueRepository } from "../../../domain/interface/IIssueRepository.js";
import type { IIssueCommentRepository } from "../../../domain/interface/IIssueCommentRepository.js";
import type { IssueCommentResponseDTO } from "../../dto/issue/IssueCommentResponseDTO.js";
import type { ICreateIssueCommentUseCase } from "../usecase interfaces/issue/ICreateIssueCommentUseCase.js";
import ApiError from "../../../shared/utils/apiError.js";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";
import { IssueVisibility } from "../../../domain/enums/IssueVisibility.js";
import { IssueStatus } from "../../../domain/enums/IssueStatus.js";
import { ISSUE_COMMENT_LIMITS } from "../../../shared/constants/issueComment.constants.js";
import { isIssueInteractionOpen } from "../../../shared/utils/issueEligibility.js";

export class CreateIssueCommentUseCase implements ICreateIssueCommentUseCase {
    constructor(
        private readonly issueRepository: IIssueRepository,
        private readonly issueCommentRepository: IIssueCommentRepository
    ) {}

    async execute(issueId: string, userId: string, body: string): Promise<IssueCommentResponseDTO> {
        if (!Types.ObjectId.isValid(issueId)) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "Invalid issue ID format");
        }

        if (!Types.ObjectId.isValid(userId)) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "Invalid user ID format");
        }

        const issue = await this.issueRepository.findById(issueId);
        if (!issue) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, "Issue not found");
        }

        const isCreator = Boolean(issue.createdBy === userId);

        // Enforce issue visibility rules
        const isApprovedPrivateIssue =
            issue.visibility === IssueVisibility.PRIVATE &&
            issue.status === IssueStatus.VERIFIED;

        if (isApprovedPrivateIssue && !isCreator) {
            throw new ApiError(HttpStatusCode.FORBIDDEN, "You do not have permission to view this private issue");
        }

        // Enforce 24-hour interaction window based on server-controlled issue creation timestamp
        if (issue.createdAt && !isIssueInteractionOpen(issue.createdAt)) {
            throw new ApiError(
                HttpStatusCode.BAD_REQUEST,
                "The 24-hour interaction window for this issue has closed"
            );
        }

        const trimmedBody = (body || "").trim();
        if (trimmedBody.length < ISSUE_COMMENT_LIMITS.MIN_LENGTH) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "Comment body cannot be empty");
        }

        if (trimmedBody.length > ISSUE_COMMENT_LIMITS.MAX_LENGTH) {
            throw new ApiError(
                HttpStatusCode.BAD_REQUEST,
                `Comment exceeds maximum length of ${ISSUE_COMMENT_LIMITS.MAX_LENGTH} characters`
            );
        }

        return await this.issueCommentRepository.createComment(issueId, userId, trimmedBody);
    }
}
export default CreateIssueCommentUseCase;
