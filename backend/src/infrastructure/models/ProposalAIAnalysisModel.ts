import { Schema, model, type Document, Types } from "mongoose";

export interface IssueProposalRecommendationDocument extends Document {
    issueId: Types.ObjectId;
    proposalsAnalyzedCount: number;
    lastProposalsUpdatedAt: Date;
    recommendedProposalId?: Types.ObjectId | undefined;
    recommendedProviderName?: string | undefined;
    recommendationReason: string;
    keyStrengths: string[];
    keyConcerns: string[];
    tradeOffs: string[];
    modelUsed: string;
    completedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface IndividualProposalSummaryDocument extends Document {
    proposalId: Types.ObjectId;
    issueId: Types.ObjectId;
    proposalUpdatedAt: Date;
    executiveSummary: string;
    solutionApproach: string;
    workforceAndSchedule: string;
    budgetAssessment: string;
    keyStrengths: string[];
    potentialConcerns: string[];
    unclearOrMissingInformation: string[];
    modelUsed: string;
    completedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const issueProposalRecommendationSchema = new Schema<IssueProposalRecommendationDocument>(
    {
        issueId: {
            type: Schema.Types.ObjectId,
            ref: "Issue",
            required: true,
            unique: true,
            index: true,
        },
        proposalsAnalyzedCount: {
            type: Number,
            required: true,
            min: 0,
        },
        lastProposalsUpdatedAt: {
            type: Date,
            required: true,
        },
        recommendedProposalId: {
            type: Schema.Types.ObjectId,
            ref: "Proposal",
        },
        recommendedProviderName: {
            type: String,
            trim: true,
        },
        recommendationReason: {
            type: String,
            required: true,
            trim: true,
        },
        keyStrengths: {
            type: [String],
            default: [],
        },
        keyConcerns: {
            type: [String],
            default: [],
        },
        tradeOffs: {
            type: [String],
            default: [],
        },
        modelUsed: {
            type: String,
            required: true,
        },
        completedAt: {
            type: Date,
            required: true,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const individualProposalSummarySchema = new Schema<IndividualProposalSummaryDocument>(
    {
        proposalId: {
            type: Schema.Types.ObjectId,
            ref: "Proposal",
            required: true,
            unique: true,
            index: true,
        },
        issueId: {
            type: Schema.Types.ObjectId,
            ref: "Issue",
            required: true,
            index: true,
        },
        proposalUpdatedAt: {
            type: Date,
            required: true,
        },
        executiveSummary: {
            type: String,
            required: true,
            trim: true,
        },
        solutionApproach: {
            type: String,
            required: true,
            trim: true,
        },
        workforceAndSchedule: {
            type: String,
            required: true,
            trim: true,
        },
        budgetAssessment: {
            type: String,
            required: true,
            trim: true,
        },
        keyStrengths: {
            type: [String],
            default: [],
        },
        potentialConcerns: {
            type: [String],
            default: [],
        },
        unclearOrMissingInformation: {
            type: [String],
            default: [],
        },
        modelUsed: {
            type: String,
            required: true,
        },
        completedAt: {
            type: Date,
            required: true,
            default: Date.now,
        },
    },
    { timestamps: true }
);

export const IssueProposalRecommendationModel = model<IssueProposalRecommendationDocument>(
    "IssueProposalRecommendation",
    issueProposalRecommendationSchema
);

export const IndividualProposalSummaryModel = model<IndividualProposalSummaryDocument>(
    "IndividualProposalSummary",
    individualProposalSummarySchema
);

