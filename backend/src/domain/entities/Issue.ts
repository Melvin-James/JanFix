import type { UploadedFile } from "./UploadedFile.js";
import type { IssueLocation } from "./IssueLocation.js";
import type { IssueVisibility } from "../enums/IssueVisibility.js";
import type { IssueStatus } from "../enums/IssueStatus.js";

export interface Issue {
    id?: string;
    createdBy: string;
    title: string;
    description: string;
    category: string; // Category ID
    categoryName?: string | undefined;
    images: UploadedFile[];
    visibility: IssueVisibility;
    location: IssueLocation;
    status: IssueStatus;
    createdAt?: Date;
    updatedAt?: Date;
}
