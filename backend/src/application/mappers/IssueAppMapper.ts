import type { Issue } from "../../domain/entities/Issue.js";
import type { IssueResponseDTO } from "../dto/issue/IssueResponseDTO.js";

export interface IssueAppMapperOptions {
    includeRejectionReason?: boolean;
}

export class IssueAppMapper {
    static toResponse(issue: Issue, options?: IssueAppMapperOptions): IssueResponseDTO {
        return {
            id: issue.id || "",
            createdBy: issue.createdBy,
            reporterName: issue.reporterName,
            title: issue.title,
            description: issue.description,
            category: issue.category,
            categoryName: issue.categoryName,
            images: issue.images || [],
            visibility: issue.visibility,
            location: issue.location,
            status: issue.status,
            createdAt: issue.createdAt,
            updatedAt: issue.updatedAt,
            ...(options?.includeRejectionReason && issue.rejectionReason
                ? { rejectionReason: issue.rejectionReason }
                : {}),
        };
    }
}
