import { Schema, model, type Document, Types } from "mongoose";
import { uploadedFileSchema } from "../database/schemas/uploadedFileSchema.js";
import { issueLocationSchema } from "../database/schemas/issueLocationSchema.js";
import { IssueVisibility } from "../../domain/enums/IssueVisibility.js";
import { IssueStatus } from "../../domain/enums/IssueStatus.js";
import { ProposalWindowStatus } from "../../domain/enums/ProposalWindowStatus.js";
import { ProposalFundingType } from "../../domain/enums/ProposalFundingType.js";
import type { UploadedFile } from "../../domain/entities/UploadedFile.js";
import type { IssueLocation } from "../../domain/entities/IssueLocation.js";

export interface IssueFundingSnapshotSubdocument {
    fundingType: ProposalFundingType;
    providerBudgetPaise: number;
    platformFeeRatePercent: number;
    platformFeePaise: number;
    fundingTargetPaise: number;
    amountRaisedPaise: number;
    selectedProposalId: Types.ObjectId;
    selectedAt: Date;
}

export interface IssueDocument extends Document {
    createdBy: Types.ObjectId;
    title: string;
    description: string;
    category: Types.ObjectId;
    images: UploadedFile[];
    visibility: IssueVisibility;
    location: IssueLocation;
    status: IssueStatus;
    rejectionReason?: string;
    proposalOpenedAt?: Date;
    proposalDeadlineAt?: Date;
    proposalWindowStatus?: ProposalWindowStatus;
    selectedProposalId?: Types.ObjectId;
    proposalSelectedAt?: Date;
    fundingSnapshot?: IssueFundingSnapshotSubdocument;
    isCommunityIssue: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const fundingSnapshotSchema = new Schema<IssueFundingSnapshotSubdocument>(
    {
        fundingType: {
            type: String,
            enum: Object.values(ProposalFundingType),
            required: true,
        },
        providerBudgetPaise: {
            type: Number,
            required: true,
            default: 0,
        },
        platformFeeRatePercent: {
            type: Number,
            required: true,
            default: 5,
        },
        platformFeePaise: {
            type: Number,
            required: true,
            default: 0,
        },
        fundingTargetPaise: {
            type: Number,
            required: true,
            default: 0,
        },
        amountRaisedPaise: {
            type: Number,
            required: true,
            default: 0,
        },
        selectedProposalId: {
            type: Schema.Types.ObjectId,
            ref: "Proposal",
            required: true,
        },
        selectedAt: {
            type: Date,
            required: true,
            default: Date.now,
        },
    },
    { _id: false }
);

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
        rejectionReason: {
            type: String,
            trim: true,
            maxlength: 1000,
        },
        proposalOpenedAt: {
            type: Date,
        },
        proposalDeadlineAt: {
            type: Date,
            index: true,
        },
        proposalWindowStatus: {
            type: String,
            enum: Object.values(ProposalWindowStatus),
            index: true,
        },
        selectedProposalId: {
            type: Schema.Types.ObjectId,
            ref: "Proposal",
            index: true,
        },
        proposalSelectedAt: {
            type: Date,
        },
        fundingSnapshot: {
            type: fundingSnapshotSchema,
        },
        isCommunityIssue: {
            type: Boolean,
            default: false,
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
issueSchema.index({ status: 1, createdAt: 1 });
issueSchema.index({ status: 1, proposalWindowStatus: 1, proposalDeadlineAt: 1 });
issueSchema.index({ isCommunityIssue: 1, status: 1, visibility: 1 });

export const IssueModel = model<IssueDocument>("Issue", issueSchema);