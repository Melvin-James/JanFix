import type { UploadedFile } from "../../../domain/entities/UploadedFile.js";
import type { IssueLocation } from "../../../domain/entities/IssueLocation.js";
import type { IssueVisibility } from "../../../domain/enums/IssueVisibility.js";
import type { IssueStatus } from "../../../domain/enums/IssueStatus.js";

export interface AdminIssueCategoryDTO {
    id: string;
    name: string;
}

export interface AdminIssueReporterDTO {
    id: string;
    fullName: string;
    email?: string | undefined;
}

export interface AdminIssueListItemDTO {
    id: string;
    title: string;
    description: string;
    category: AdminIssueCategoryDTO;
    reporter: AdminIssueReporterDTO;
    images: UploadedFile[];
    visibility: IssueVisibility;
    location: IssueLocation;
    status: IssueStatus;
    upvoteCount: number;
    commentCount: number;
    createdAt: Date;
    updatedAt: Date;
}
