import { Schema, model, type Document, Types } from "mongoose";
import { ProviderType } from "../../domain/enums/ProviderType.js";
import { ProposalStatus } from "../../domain/enums/ProposalStatus.js";
import { NgoParticipationMode } from "../../domain/enums/NgoParticipationMode.js";

export interface BudgetItemSubdocument {
    _id: Types.ObjectId;
    heading: string;
    amountPaise: number;
}

export interface ExecutionRoadmapItemSubdocument {
    _id: Types.ObjectId;
    heading: string;
    description: string;
    startTime: string;
    endTime: string;
    order: number;
}

export interface ProposalNgoDetailsSubdocument {
    requiresFunding: boolean;
    participationMode: NgoParticipationMode;
    expectedParticipants?: number | undefined;
    requiresCommunityChat: boolean;
}

export interface ProposalIssueSnapshotSubdocument {
    title: string;
    description: string;
}

export interface ProposalDocument extends Document {
    issueId: Types.ObjectId;
    providerId: Types.ObjectId;
    providerType: ProviderType;
    status: ProposalStatus;
    issueSnapshot: ProposalIssueSnapshotSubdocument;
    estimatedTeamSize: number;
    estimatedDurationHours: number;
    budgetItems: BudgetItemSubdocument[];
    totalBudgetPaise: number;
    executionRoadmap: ExecutionRoadmapItemSubdocument[];
    ngoDetails?: ProposalNgoDetailsSubdocument | undefined;
    submittedAt: Date;
    withdrawnAt?: Date | undefined;
    createdAt: Date;
    updatedAt: Date;
}

const budgetItemSchema = new Schema<BudgetItemSubdocument>(
    {
        heading: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        amountPaise: {
            type: Number,
            required: true,
            min: 1,
        },
    },
    { _id: true }
);

const executionRoadmapItemSchema = new Schema<ExecutionRoadmapItemSubdocument>(
    {
        heading: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },
        startTime: {
            type: String,
            required: true,
            trim: true,
        },
        endTime: {
            type: String,
            required: true,
            trim: true,
        },
        order: {
            type: Number,
            required: true,
            default: 0,
        },
    },
    { _id: true }
);

const ngoDetailsSchema = new Schema<ProposalNgoDetailsSubdocument>(
    {
        requiresFunding: {
            type: Boolean,
            required: true,
        },
        participationMode: {
            type: String,
            enum: Object.values(NgoParticipationMode),
            required: true,
        },
        expectedParticipants: {
            type: Number,
            min: 1,
        },
        requiresCommunityChat: {
            type: Boolean,
            required: true,
        },
    },
    { _id: false }
);

const issueSnapshotSchema = new Schema<ProposalIssueSnapshotSubdocument>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { _id: false }
);

const proposalSchema = new Schema<ProposalDocument>(
    {
        issueId: {
            type: Schema.Types.ObjectId,
            ref: "Issue",
            required: true,
            index: true,
        },
        providerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        providerType: {
            type: String,
            enum: Object.values(ProviderType),
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(ProposalStatus),
            default: ProposalStatus.SUBMITTED,
            required: true,
            index: true,
        },
        issueSnapshot: {
            type: issueSnapshotSchema,
            required: true,
        },
        estimatedTeamSize: {
            type: Number,
            required: true,
            min: 1,
        },
        estimatedDurationHours: {
            type: Number,
            required: true,
            min: 0.5,
        },
        budgetItems: {
            type: [budgetItemSchema],
            validate: [
                (val: BudgetItemSubdocument[]) => val.length >= 1,
                "Proposal must contain at least one budget item",
            ],
            default: [],
        },
        totalBudgetPaise: {
            type: Number,
            required: true,
            min: 1,
        },
        executionRoadmap: {
            type: [executionRoadmapItemSchema],
            validate: [
                (val: ExecutionRoadmapItemSubdocument[]) => val.length >= 1,
                "Proposal must contain at least one roadmap item",
            ],
            default: [],
        },
        ngoDetails: {
            type: ngoDetailsSchema,
        },
        submittedAt: {
            type: Date,
            required: true,
            default: Date.now,
        },
        withdrawnAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
proposalSchema.index({ issueId: 1, providerId: 1 }, { unique: true });
proposalSchema.index({ issueId: 1, status: 1 });
proposalSchema.index({ providerId: 1, createdAt: -1 });

export const ProposalModel = model<ProposalDocument>("Proposal", proposalSchema);
