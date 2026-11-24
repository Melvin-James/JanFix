import { Types } from "mongoose";
import type { IIssueRepository } from "../../../domain/interface/IIssueRepository.ts";
import type { IIssueVoteRepository } from "../../../domain/interface/IIssueVoteRepository.ts";
import type { IssueVoteResponseDTO } from "../../dto/issue/IssueVoteResponseDTO.ts";
import type { IGetIssueUpvoteStatusUseCase } from "../usecase interfaces/issue/IGetIssueUpvoteStatusUseCase.ts";
import ApiError from "../../../shared/utils/apiError.ts";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.ts";
import { IssueVisibility } from "../../../domain/enums/IssueVisibility.ts";
import { IssueStatus } from "../../../domain/enums/IssueStatus.ts";

export class GetIssueUpvoteStatusUseCase implements IGetIssueUpvoteStatusUseCase {
    constructor(
        private readonly _issueRepository: IIssueRepository,
        private readonly _issueVoteRepository: IIssueVoteRepository
    ) {}

    async execute(issueId: string, userId?: string): Promise<IssueVoteResponseDTO> {
        if (!Types.ObjectId.isValid(issueId)) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "Invalid issue ID format");
        }

        const issue = await this._issueRepository.findById(issueId);
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

        const [upvoteCount, hasUpvoted] = await Promise.all([
            this._issueVoteRepository.countByIssueId(issueId),
            userId && Types.ObjectId.isValid(userId)
                ? this._issueVoteRepository.hasUserVoted(issueId, userId)
                : Promise.resolve(false),
        ]);

        return {
            issueId,
            hasUpvoted,
            upvoteCount,
        };
    }
}
export default GetIssueUpvoteStatusUseCase;
