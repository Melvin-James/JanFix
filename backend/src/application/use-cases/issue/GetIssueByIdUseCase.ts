import type { IIssueRepository } from "../../../domain/interface/IIssueRepository.js";

import type { IssueResponseDTO } from "../../dto/issue/IssueResponseDTO.js";

import type { IGetIssueByIdUseCase } from "../usecase interfaces/issue/IGetIssueByIdUseCase.js";

import { IssueAppMapper } from "../../mappers/IssueAppMapper.js";

import ApiError from "../../../shared/utils/apiError.js";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

import { IssueVisibility } from "../../../domain/enums/IssueVisibility.js";

import { IssueStatus } from "../../../domain/enums/IssueStatus.js";

import type { IStorageService } from "../../services/IStorageService.js";

import { refreshUploadedFileUrls } from "../../services/refreshUploadedFileUrls.js";


import { Role } from "../../../domain/enums/Role.js";

export class GetIssueByIdUseCase implements IGetIssueByIdUseCase {
    constructor(private readonly issueRepository: IIssueRepository, private readonly storageService: IStorageService) {}

    async execute(
        issueId: string,
        requestingUserId?: string,
        requestingUserRoles?: Role[]
    ): Promise<IssueResponseDTO> {
        const issue = await this.issueRepository.findById(issueId);
        if (!issue) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, "Issue not found");
        }

        const isCreator = Boolean(requestingUserId && issue.createdBy === requestingUserId);
        const isAdmin = Boolean(requestingUserRoles?.includes(Role.ADMIN));

        // Approved private issues are restricted to the original reporter
        // and authorized administrators
        const isApprovedPrivateIssue =
            issue.visibility === IssueVisibility.PRIVATE &&
            issue.status === IssueStatus.VERIFIED;

        if (isApprovedPrivateIssue && !isCreator && !isAdmin) {
            throw new ApiError(HttpStatusCode.FORBIDDEN, "You do not have permission to view this private issue");
        }

        // Rejected issues are restricted to the original reporter and authorized administrators
        if (issue.status === IssueStatus.REJECTED && !isCreator && !isAdmin) {
            throw new ApiError(HttpStatusCode.FORBIDDEN, "You do not have permission to view this rejected issue");
        }
        
        const response = IssueAppMapper.toResponse(issue, {
            includeRejectionReason: isCreator || isAdmin,
        });

        return {
            ...response,
            images: await refreshUploadedFileUrls(response.images, this.storageService)
        }
    }
}
