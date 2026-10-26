import { Types } from "mongoose";
import type { IIssueRepository } from "../../../domain/interface/IIssueRepository.js";
import type { IIssueVoteRepository } from "../../../domain/interface/IIssueVoteRepository.js";
import type { IssueVoteResponseDTO } from "../../dto/issue/IssueVoteResponseDTO.js";
import type { IRemoveIssueUpvoteUseCase } from "../usecase interfaces/issue/IRemoveIssueUpvoteUseCase.js";
import ApiError from "../../../shared/utils/apiError.js";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";
import { IssueVisibility } from "../../../domain/enums/IssueVisibility.js";
import { IssueStatus } from "../../../domain/enums/IssueStatus.js";

export class RemoveIssueUpvoteUseCase implements IRemoveIssueUpvoteUseCase {
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

        // Enforce issue visibility rules
        const isApprovedPrivateIssue =
            issue.visibility === IssueVisibility.PRIVATE &&
            issue.status === IssueStatus.VERIFIED;

        if (isApprovedPrivateIssue && !isCreator) {
            throw new ApiError(HttpStatusCode.FORBIDDEN, "You do not have permission to view this private issue");
        }

        // Remove authenticated user's vote (idempotent: safe if no vote exists)
        await this.issueVoteRepository.removeVote(issueId, userId);

        const upvoteCount = await this.issueVoteRepository.countByIssueId(issueId);

        return {
            issueId,
            hasUpvoted: false,
            upvoteCount,
        };
    }
}
export default RemoveIssueUpvoteUseCase;
