import type { UploadedFile } from "../../../domain/entities/UploadedFile.ts";
import type { IssueLocation } from "../../../domain/entities/IssueLocation.ts";
import type { IssueVisibility } from "../../../domain/enums/IssueVisibility.ts";

export interface CreateIssueDTO {
    createdBy: string;
    title: string;
    description: string;
    categoryId: string;
    images: UploadedFile[];
    visibility: IssueVisibility;
    location: IssueLocation;
}
