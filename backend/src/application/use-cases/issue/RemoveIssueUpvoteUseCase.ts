import { Types } from "mongoose";
import type { IIssueRepository } from "../../../domain/interface/IIssueRepository.ts";
import type { IIssueVoteRepository } from "../../../domain/interface/IIssueVoteRepository.ts";
import type { IssueVoteResponseDTO } from "../../dto/issue/IssueVoteResponseDTO.ts";
import type { IRemoveIssueUpvoteUseCase } from "../usecase interfaces/issue/IRemoveIssueUpvoteUseCase.ts";
import ApiError from "../../../shared/utils/apiError.ts";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.ts";
import { IssueVisibility } from "../../../domain/enums/IssueVisibility.ts";
import { IssueStatus } from "../../../domain/enums/IssueStatus.ts";

export class RemoveIssueUpvoteUseCase implements IRemoveIssueUpvoteUseCase {
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

        // Enforce issue visibility rules
        const isApprovedPrivateIssue =
            issue.visibility === IssueVisibility.PRIVATE &&
            issue.status === IssueStatus.VERIFIED;

        if (isApprovedPrivateIssue && !isCreator) {
            throw new ApiError(HttpStatusCode.FORBIDDEN, "You do not have permission to view this private issue");
        }

        // Remove authenticated user's vote (idempotent: safe if no vote exists)
        await this._issueVoteRepository.removeVote(issueId, userId);

        const upvoteCount = await this._issueVoteRepository.countByIssueId(issueId);

        return {
            issueId,
            hasUpvoted: false,
            upvoteCount,
        };
    }
}
export default RemoveIssueUpvoteUseCase;
