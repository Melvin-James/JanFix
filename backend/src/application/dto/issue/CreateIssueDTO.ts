import type { UploadedFile } from "../../../domain/entities/UploadedFile.js";
import type { IssueLocation } from "../../../domain/entities/IssueLocation.js";
import type { IssueVisibility } from "../../../domain/enums/IssueVisibility.js";

export interface CreateIssueDTO {
    createdBy: string;
    title: string;
    description: string;
    categoryId: string;
    images: UploadedFile[];
    visibility: IssueVisibility;
    location: IssueLocation;
}
