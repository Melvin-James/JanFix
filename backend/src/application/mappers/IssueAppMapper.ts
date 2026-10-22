import type { Issue } from "../../domain/entities/Issue.js";
import type { IssueResponseDTO } from "../dto/issue/IssueResponseDTO.js";

export class IssueAppMapper {
    static toResponse(issue: Issue): IssueResponseDTO {
        return {
            id: issue.id || "",
            createdBy: issue.createdBy,
            title: issue.title,
            description: issue.description,
            category: issue.category,
            images: issue.images || [],
            visibility: issue.visibility,
            location: issue.location,
            status: issue.status,
            createdAt: issue.createdAt,
            updatedAt: issue.updatedAt,
        };
    }
}
