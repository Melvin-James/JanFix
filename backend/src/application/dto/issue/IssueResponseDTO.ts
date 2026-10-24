import type { UploadedFile } from "../../../domain/entities/UploadedFile.js";
import type { IssueLocation } from "../../../domain/entities/IssueLocation.js";
import type { IssueVisibility } from "../../../domain/enums/IssueVisibility.js";
import type { IssueStatus } from "../../../domain/enums/IssueStatus.js";

export interface IssueResponseDTO {
    id: string;
    createdBy: string;
    title: string;
    description: string;
    category: string;
    categoryName?: string | undefined;
    images: UploadedFile[];
    visibility: IssueVisibility;
    location: IssueLocation;
    status: IssueStatus;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
}
