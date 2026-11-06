import type { UploadedFile } from "../../../domain/entities/UploadedFile.js";
import type { IssueLocation } from "../../../domain/entities/IssueLocation.js";
import type { IssueVisibility } from "../../../domain/enums/IssueVisibility.js";
import type { IssueStatus } from "../../../domain/enums/IssueStatus.js";
import type { ProposalWindowStatus } from "../../../domain/enums/ProposalWindowStatus.js";

export interface IssueResponseDTO {
    id: string;
    createdBy: string;
    reporterName?: string | undefined;
    title: string;
    description: string;
    category: string;
    categoryName?: string | undefined;
    images: UploadedFile[];
    visibility: IssueVisibility;
    location: IssueLocation;
    status: IssueStatus;
    rejectionReason?: string | undefined;
    proposalOpenedAt?: Date | undefined;
    proposalDeadlineAt?: Date | undefined;
    proposalWindowStatus?: ProposalWindowStatus | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
}
