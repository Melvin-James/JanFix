import { Schema, model, type Document, Types } from "mongoose";

export interface IssueInterestDocument extends Document {
    issueId: Types.ObjectId;
    providerId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const issueInterestSchema = new Schema<IssueInterestDocument>(
    {
        issueId: {
            type: Schema.Types.ObjectId,
            ref: "Issue",
            required: [true, "Issue reference is required"],
        },
        providerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Provider reference is required"],
        },
    },
    {
        timestamps: true,
    }
);

// Compound unique index: guarantees a provider can express interest in an issue at most once,
// even under concurrent duplicate requests.
issueInterestSchema.index({ issueId: 1, providerId: 1 }, { unique: true });

export const IssueInterestModel = model<IssueInterestDocument>("IssueInterest", issueInterestSchema);
export default IssueInterestModel;
