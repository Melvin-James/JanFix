import type { Document } from "mongoose";
import type { IssueComment } from "../../domain/entities/IssueComment.js";
import type { IssueCommentDocument } from "../models/IssueCommentModel.js";

export class IssueCommentMapper {
    static toEntity(doc: Document): IssueComment {
        const document = doc as IssueCommentDocument;
        return {
            id: document._id.toString(),
            issueId: document.issueId?.toString(),
            userId: document.userId?.toString(),
            body: document.body,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
        };
    }
}
