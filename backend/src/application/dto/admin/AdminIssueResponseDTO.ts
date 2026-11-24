import type { UploadedFile } from "../../../domain/entities/UploadedFile.ts";
import type { IssueLocation } from "../../../domain/entities/IssueLocation.ts";
import type { IssueVisibility } from "../../../domain/enums/IssueVisibility.ts";
import type { IssueStatus } from "../../../domain/enums/IssueStatus.ts";

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
