import { Schema, model, type Document, Types } from "mongoose";
import { ISSUE_COMMENT_LIMITS } from "../../shared/constants/issueComment.constants.js";

export const MAX_COMMENT_LENGTH = ISSUE_COMMENT_LIMITS.MAX_LENGTH;

export interface IssueCommentDocument extends Document {
    issueId: Types.ObjectId;
    userId: Types.ObjectId;
    body: string;
    createdAt: Date;
    updatedAt: Date;
}

const issueCommentSchema = new Schema<IssueCommentDocument>(
    {
        issueId: {
            type: Schema.Types.ObjectId,
            ref: "Issue",
            required: [true, "Issue reference is required"],
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User reference is required"],
        },
        body: {
            type: String,
            required: [true, "Comment body is required"],
            trim: true,
            maxlength: [
                MAX_COMMENT_LENGTH,
                `Comment exceeds maximum length of ${MAX_COMMENT_LENGTH} characters`,
            ],
            validate: {
                validator: (val: string) => typeof val === "string" && val.trim().length > 0,
                message: "Comment body cannot be empty or contain only whitespace",
            },
        },
    },
    {
        timestamps: true,
    }
);

// Chronological index: optimized for retrieving comments for an issue in chronological order
issueCommentSchema.index({ issueId: 1, createdAt: 1 });

export const IssueCommentModel = model<IssueCommentDocument>("IssueComment", issueCommentSchema);
export default IssueCommentModel;
