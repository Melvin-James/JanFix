import type { IIssueRepository } from "../../../domain/interface/IIssueRepository.js";
import type { IssueResponseDTO } from "../../dto/issue/IssueResponseDTO.js";
import type { IGetIssueByIdUseCase } from "../usecase interfaces/issue/IGetIssueByIdUseCase.js";
import { IssueAppMapper } from "../../mappers/IssueAppMapper.js";
import ApiError from "../../../shared/utils/apiError.js";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";
import { IssueVisibility } from "../../../domain/enums/IssueVisibility.js";
import { IssueStatus } from "../../../domain/enums/IssueStatus.js";

export class GetIssueByIdUseCase implements IGetIssueByIdUseCase {
    constructor(private readonly issueRepository: IIssueRepository) {}

    async execute(issueId: string, requestingUserId: string): Promise<IssueResponseDTO> {
        const issue = await this.issueRepository.findById(issueId);
        if (!issue) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, "Issue not found");
        }

        const isCreator = issue.createdBy === requestingUserId;

        // If the issue is PRIVATE and user is not the creator, forbid access
        if (issue.visibility === IssueVisibility.PRIVATE && !isCreator) {
            throw new ApiError(HttpStatusCode.FORBIDDEN, "You do not have permission to view this private issue");
        }

        // If unverified public issue, only creator can view it during this stage
        if (
            issue.visibility === IssueVisibility.PUBLIC &&
            issue.status !== IssueStatus.VERIFIED &&
            !isCreator
        ) {
            throw new ApiError(HttpStatusCode.FORBIDDEN, "Issue is pending verification and is only visible to the reporter");
        }

        return IssueAppMapper.toResponse(issue);
    }
}
