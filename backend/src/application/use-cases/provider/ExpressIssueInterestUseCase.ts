import type { IExpressIssueInterestUseCase, ExpressIssueInterestResult } from "../usecase interfaces/provider/IExpressIssueInterestUseCase.js";
import type { IIssueRepository } from "../../../domain/interface/IIssueRepository.js";
import type { IIssueInterestRepository } from "../../../domain/interface/IIssueInterestRepository.js";
import ApiError from "../../../shared/utils/apiError.js";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";
import { IssueVisibility } from "../../../domain/enums/IssueVisibility.js";
import { IssueStatus } from "../../../domain/enums/IssueStatus.js";

export class ExpressIssueInterestUseCase implements IExpressIssueInterestUseCase {
    constructor(
        private readonly issueRepository: IIssueRepository,
        private readonly issueInterestRepository: IIssueInterestRepository
    ) {}

    async execute(issueId: string, providerId: string): Promise<ExpressIssueInterestResult> {
        const issue = await this.issueRepository.findById(issueId);

        if (!issue) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, "Issue not found");
        }

        // Privacy rule: Only public issues are eligible for provider interest
        if (issue.visibility !== IssueVisibility.PUBLIC) {
            throw new ApiError(
                HttpStatusCode.FORBIDDEN,
                "Service providers can only express interest in public issues."
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
        const alreadyInterested = await this.issueInterestRepository.exists(issueId, providerId);
        if (alreadyInterested) {
            throw new ApiError(
                HttpStatusCode.CONFLICT,
                "You have already expressed interest in this issue."
            );
        }

        await this.issueInterestRepository.create(issueId, providerId);

        return {
            success: true,
            message: "Interest expressed successfully.",
        };
    }
}

export default ExpressIssueInterestUseCase;
