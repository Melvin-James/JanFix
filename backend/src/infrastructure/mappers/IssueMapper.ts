import type { Document } from "mongoose";
import type { Issue } from "../../domain/entities/Issue.js";
import type { IssueDocument } from "../models/IssueModel.js";

export class IssueMapper {
    static toEntity(doc: Document): Issue {
        const document = doc as IssueDocument;
        return {
            id: document._id.toString(),
            createdBy: document.createdBy?.toString(),
            title: document.title,
            description: document.description,
            category: document.category?.toString(),
            images: document.images || [],
            visibility: document.visibility,
            location: document.location,
            status: document.status,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
        };
    }
}
