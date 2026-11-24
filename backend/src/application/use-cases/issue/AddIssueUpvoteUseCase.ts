import { Types } from "mongoose";
import type { IIssueRepository } from "../../../domain/interface/IIssueRepository.ts";
import type { IIssueVoteRepository } from "../../../domain/interface/IIssueVoteRepository.ts";
import type { IssueVoteResponseDTO } from "../../dto/issue/IssueVoteResponseDTO.ts";
import type { IAddIssueUpvoteUseCase } from "../usecase interfaces/issue/IAddIssueUpvoteUseCase.ts";
import ApiError from "../../../shared/utils/apiError.ts";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.ts";
import { IssueVisibility } from "../../../domain/enums/IssueVisibility.ts";
import { IssueStatus } from "../../../domain/enums/IssueStatus.ts";
import { isIssueInteractionOpen } from "../../../shared/utils/issueEligibility.ts";

export class AddIssueUpvoteUseCase implements IAddIssueUpvoteUseCase {
    constructor(
        private readonly _issueRepository: IIssueRepository,
        private readonly _issueVoteRepository: IIssueVoteRepository
    ) {}

    async execute(issueId: string, userId: string): Promise<IssueVoteResponseDTO> {
        if (!Types.ObjectId.isValid(issueId)) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "Invalid issue ID format");
        }

        if (!Types.ObjectId.isValid(userId)) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "Invalid user ID format");
        }

        const issue = await this._issueRepository.findById(issueId);
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
        await this._issueVoteRepository.addVote(issueId, userId);

        const upvoteCount = await this._issueVoteRepository.countByIssueId(issueId);

        return {
            issueId,
            hasUpvoted: true,
            upvoteCount,
        };
    }
}
export default AddIssueUpvoteUseCase;
