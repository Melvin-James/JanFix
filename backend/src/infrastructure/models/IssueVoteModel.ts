import { Schema, model, type Document, Types } from "mongoose";

export interface IssueVoteDocument extends Document {
    issueId: Types.ObjectId;
    userId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const issueVoteSchema = new Schema<IssueVoteDocument>(
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
    },
    {
        timestamps: true,
    }
);

// Compound unique index: guarantees a user can upvote an issue at most once,
// even under concurrent duplicate vote attempts.
issueVoteSchema.index({ issueId: 1, userId: 1 }, { unique: true });

export const IssueVoteModel = model<IssueVoteDocument>("IssueVote", issueVoteSchema);
export default IssueVoteModel;
