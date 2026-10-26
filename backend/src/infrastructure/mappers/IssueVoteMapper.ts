import type { Document } from "mongoose";
import type { IssueVote } from "../../domain/entities/IssueVote.js";
import type { IssueVoteDocument } from "../models/IssueVoteModel.js";

export class IssueVoteMapper {
    static toEntity(doc: Document): IssueVote {
        const document = doc as IssueVoteDocument;
        return {
            id: document._id.toString(),
            issueId: document.issueId?.toString(),
            userId: document.userId?.toString(),
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
        };
    }
}
