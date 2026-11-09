import { Schema, model, type Document, Types } from "mongoose";
import { AIAnalysisStatus } from "../../domain/enums/AIAnalysisStatus.js";
import { AIOverallClassification } from "../../domain/enums/AIOverallClassification.js";
import { CommentClassification } from "../../domain/enums/CommentClassification.js";

export interface AICommentClassificationSubdocument {
    commentId: string;
    classification: CommentClassification;
    explanation?: string | undefined;
}

export interface IssueAIAnalysisDocument extends Document {
    issueId: Types.ObjectId;
    status: AIAnalysisStatus;
    cutoffDate: Date;
    totalEligibleComments: number;
    supportCount: number;
    challengeCount: number;
    neutralCount: number;
    score: number | null;
    overallClassification: AIOverallClassification;
    summary: string;
    commentClassifications: AICommentClassificationSubdocument[];
    modelUsed?: string | undefined;
    completedAt?: Date | undefined;
    errorMessage?: string | undefined;
    createdAt: Date;
    updatedAt: Date;
}

const commentClassificationSchema = new Schema<AICommentClassificationSubdocument>(
    {
        commentId: {
            type: String,
            required: [true, "Comment ID reference is required"],
        },
        classification: {
            type: String,
            enum: Object.values(CommentClassification),
            required: [true, "Comment classification is required"],
        },
        explanation: {
            type: String,
            trim: true,
            maxlength: 1000,
        },
    },
    { _id: false }
);

const issueAIAnalysisSchema = new Schema<IssueAIAnalysisDocument>(
    {
        issueId: {
            type: Schema.Types.ObjectId,
            ref: "Issue",
            required: [true, "Issue reference is required"],
            unique: true,
            index: true,
        },
        status: {
            type: String,
            enum: Object.values(AIAnalysisStatus),
            default: AIAnalysisStatus.PENDING,
            required: true,
            index: true,
        },
        cutoffDate: {
            type: Date,
            required: [true, "Interaction period cutoff date is required"],
        },
        totalEligibleComments: {
            type: Number,
            default: 0,
            min: 0,
        },
        supportCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        challengeCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        neutralCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        score: {
            type: Number,
            default: null,
            min: 0,
            max: 100,
        },
        overallClassification: {
            type: String,
            enum: Object.values(AIOverallClassification),
            default: AIOverallClassification.INSUFFICIENT_DATA,
            required: true,
        },
        summary: {
            type: String,
            default: "",
            trim: true,
            maxlength: 4000,
        },
        commentClassifications: {
            type: [commentClassificationSchema],
            default: [],
        },
        modelUsed: {
            type: String,
            trim: true,
        },
        completedAt: {
            type: Date,
        },
        errorMessage: {
            type: String,
            trim: true,
            maxlength: 1000,
        },
    },
    {
        timestamps: true,
    }
);

export const IssueAIAnalysisModel = model<IssueAIAnalysisDocument>(
    "IssueAIAnalysis",
    issueAIAnalysisSchema
);
export default IssueAIAnalysisModel;

