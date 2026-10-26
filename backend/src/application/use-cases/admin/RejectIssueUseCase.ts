import { Types } from "mongoose";
import type { IRejectIssueUseCase } from "../usecase interfaces/admin/IRejectIssueUseCase.js";
import type { IIssueRepository } from "../../../domain/interface/IIssueRepository.js";
import type { IStorageService } from "../../services/IStorageService.js";
import type { IssueResponseDTO } from "../../dto/issue/IssueResponseDTO.js";
import { IssueStatus } from "../../../domain/enums/IssueStatus.js";
import { IssueAppMapper } from "../../mappers/IssueAppMapper.js";
import { refreshUploadedFileUrls } from "../../services/refreshUploadedFileUrls.js";
import ApiError from "../../../shared/utils/apiError.js";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";
import { AppMessages } from "../../../shared/constants/messages.js";
import { isIssueEligibleForReview } from "../../../shared/utils/issueEligibility.js";

const PENDING_REVIEW_STATUSES = [IssueStatus.REPORTED];

export class RejectIssueUseCase implements IRejectIssueUseCase {
    constructor(
        private readonly issueRepository: IIssueRepository,
        private readonly storageService: IStorageService
    ) {}

    async execute(
        issueId: string,
        rejectionReason: string,
        serverNow: Date = new Date()
    ): Promise<IssueResponseDTO> {
        if (!issueId || !Types.ObjectId.isValid(issueId)) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "Invalid issue ID");
        }

        const trimmedReason = typeof rejectionReason === "string" ? rejectionReason.trim() : "";
        if (!trimmedReason) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "Rejection reason cannot be empty");
        }
        if (trimmedReason.length > 1000) {
            throw new ApiError(
                HttpStatusCode.BAD_REQUEST,
                "Rejection reason cannot exceed 1000 characters"
            );
        }

        // 1. Initial lookup to distinguish missing from ineligible or already decided
        const issue = await this.issueRepository.findById(issueId);
        if (!issue) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, AppMessages.ERROR.ISSUE_NOT_FOUND);
        }

        // 2. Validate 24-hour review eligibility
        if (!isIssueEligibleForReview(issue.createdAt!, serverNow)) {
            throw new ApiError(
                HttpStatusCode.BAD_REQUEST,
                AppMessages.ERROR.ISSUE_NOT_ELIGIBLE_FOR_REVIEW
            );
        }

        // 3. Validate valid status transitions
        if (issue.status === IssueStatus.REJECTED) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, AppMessages.ERROR.ISSUE_ALREADY_REJECTED);
        }

        if (issue.status === IssueStatus.VERIFIED) {
            throw new ApiError(
                HttpStatusCode.BAD_REQUEST,
                "Approved issues cannot be rejected directly"
            );
        }

        if (!PENDING_REVIEW_STATUSES.includes(issue.status)) {
            throw new ApiError(
                HttpStatusCode.BAD_REQUEST,
                AppMessages.ERROR.INVALID_ISSUE_STATUS_TRANSITION
            );
        }

        // 4. Conditional atomic update prevents concurrent conflicting decisions
        const updated = await this.issueRepository.updateStatusIfEligible(
            issueId,
            IssueStatus.REJECTED,
            PENDING_REVIEW_STATUSES,
            trimmedReason,
            serverNow
        );

        if (!updated) {
            // Concurrent request modified the issue state between lookup and atomic update
            const latest = await this.issueRepository.findById(issueId);
            if (!latest) {
                throw new ApiError(HttpStatusCode.NOT_FOUND, AppMessages.ERROR.ISSUE_NOT_FOUND);
            }
            if (latest.status === IssueStatus.REJECTED) {
                throw new ApiError(HttpStatusCode.BAD_REQUEST, AppMessages.ERROR.ISSUE_ALREADY_REJECTED);
            }
            if (latest.status === IssueStatus.VERIFIED) {
                throw new ApiError(
                    HttpStatusCode.BAD_REQUEST,
                    "Approved issues cannot be rejected directly"
                );
            }
            throw new ApiError(
                HttpStatusCode.CONFLICT,
                "Issue status was changed by another administrative action"
            );
        }

        // 5. Map response and refresh presigned S3 URLs
        const response = IssueAppMapper.toResponse(updated, { includeRejectionReason: true });
        return {
            ...response,
            images: await refreshUploadedFileUrls(response.images, this.storageService),
        };
    }
}
