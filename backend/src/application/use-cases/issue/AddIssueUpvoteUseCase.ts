import { Types } from "mongoose";
import type { IIssueRepository } from "../../../domain/interface/IIssueRepository.js";
import type { IIssueVoteRepository } from "../../../domain/interface/IIssueVoteRepository.js";
import type { IssueVoteResponseDTO } from "../../dto/issue/IssueVoteResponseDTO.js";
import type { IAddIssueUpvoteUseCase } from "../usecase interfaces/issue/IAddIssueUpvoteUseCase.js";
import ApiError from "../../../shared/utils/apiError.js";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";
import { IssueVisibility } from "../../../domain/enums/IssueVisibility.js";
import { IssueStatus } from "../../../domain/enums/IssueStatus.js";
import { isIssueInteractionOpen } from "../../../shared/utils/issueEligibility.js";

export class AddIssueUpvoteUseCase implements IAddIssueUpvoteUseCase {
    constructor(
        private readonly issueRepository: IIssueRepository,
        private readonly issueVoteRepository: IIssueVoteRepository
    ) {}

    async execute(issueId: string, userId: string): Promise<IssueVoteResponseDTO> {
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

        // Enforce issue visibility rules: unauthorized users cannot view/interact with approved private issues
        const isApprovedPrivateIssue =
            issue.visibility === IssueVisibility.PRIVATE &&
            issue.status === IssueStatus.VERIFIED;

        if (isApprovedPrivateIssue && !isCreator) {
            throw new ApiError(HttpStatusCode.FORBIDDEN, "You do not have permission to view this private issue");
        }

        // Prevent creator from upvoting their own reported issue
        if (isCreator) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "You cannot upvote your own issue");
        }

        // Enforce 24-hour interaction window based on server-controlled issue creation timestamp
        if (issue.createdAt && !isIssueInteractionOpen(issue.createdAt)) {
            throw new ApiError(
                HttpStatusCode.BAD_REQUEST,
                "The 24-hour interaction window for this issue has closed"
            );
        }

        // Persist vote (idempotent: unique compound index handles concurrent duplicates)
        await this.issueVoteRepository.addVote(issueId, userId);

        const upvoteCount = await this.issueVoteRepository.countByIssueId(issueId);

        return {
            issueId,
            hasUpvoted: true,
            upvoteCount,
        };
    }
}
export default AddIssueUpvoteUseCase;
