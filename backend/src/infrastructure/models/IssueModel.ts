import { Schema, model, type Document, Types } from "mongoose";
import { uploadedFileSchema } from "../database/schemas/uploadedFileSchema.js";
import { issueLocationSchema } from "../database/schemas/issueLocationSchema.js";
import { IssueVisibility } from "../../domain/enums/IssueVisibility.js";
import { IssueStatus } from "../../domain/enums/IssueStatus.js";
import type { UploadedFile } from "../../domain/entities/UploadedFile.js";
import type { IssueLocation } from "../../domain/entities/IssueLocation.js";

export interface IssueDocument extends Document {
    createdBy: Types.ObjectId;
    title: string;
    description: string;
    category: Types.ObjectId;
    images: UploadedFile[];
    visibility: IssueVisibility;
    location: IssueLocation;
    status: IssueStatus;
    createdAt: Date;
    updatedAt: Date;
}

const issueSchema = new Schema<IssueDocument>(
    {
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },
        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 3000,
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: true,
            index: true,
        },
        images: {
            type: [uploadedFileSchema],
            validate: [
                (val: UploadedFile[]) => val.length <= 5,
                "{PATH} exceeds the limit of 5 photos",
            ],
            default: [],
        },
        visibility: {
            type: String,
            enum: Object.values(IssueVisibility),
            required: true,
        },
        location: {
            type: issueLocationSchema,
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(IssueStatus),
            default: IssueStatus.REPORTED,
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for query performance
issueSchema.index({ createdAt: -1 });
issueSchema.index({ createdBy: 1, createdAt: -1 });
issueSchema.index({ status: 1, visibility: 1 });

export const IssueModel = model<IssueDocument>("Issue", issueSchema);
