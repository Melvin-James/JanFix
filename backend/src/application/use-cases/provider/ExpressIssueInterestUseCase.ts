import type { IExpressIssueInterestUseCase, ExpressIssueInterestResult } from "../usecase interfaces/provider/IExpressIssueInterestUseCase.ts";
import type { IIssueRepository } from "../../../domain/interface/IIssueRepository.ts";
import type { IIssueInterestRepository } from "../../../domain/interface/IIssueInterestRepository.ts";
import ApiError from "../../../shared/utils/apiError.ts";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.ts";
import { IssueStatus } from "../../../domain/enums/IssueStatus.ts";
import { IssueVisibility } from "../../../domain/enums/IssueVisibility.ts";

export class ExpressIssueInterestUseCase implements IExpressIssueInterestUseCase {
    constructor(
        private readonly _issueRepository: IIssueRepository,
        private readonly _issueInterestRepository: IIssueInterestRepository
    ) {}

    async execute(issueId: string, providerId: string): Promise<ExpressIssueInterestResult> {
        const issue = await this._issueRepository.findById(issueId);

        if (!issue) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, "Issue not found");
        }

        // Visibility rule: Private issues cannot receive provider interest
        if (issue.visibility === IssueVisibility.PRIVATE) {
            throw new ApiError(
                HttpStatusCode.FORBIDDEN,
                "Cannot express interest in a private issue."
            );
        }

        // Status rule: Rejected issues cannot receive provider interest
        if (issue.status === IssueStatus.REJECTED) {
            throw new ApiError(
                HttpStatusCode.FORBIDDEN,
                "Cannot express interest in a rejected issue."
            );
        }

        // Prevent duplicate interest submissions
        const alreadyInterested = await this._issueInterestRepository.exists(issueId, providerId);
        if (alreadyInterested) {
            throw new ApiError(
                HttpStatusCode.CONFLICT,
                "You have already expressed interest in this issue."
            );
        }

        await this._issueInterestRepository.create(issueId, providerId);

        return {
            success: true,
            message: "Interest expressed successfully.",
        };
    }
}

export default ExpressIssueInterestUseCase;
