import { Types } from "mongoose";
import type { IIssueAIAnalysisRepository } from "../../domain/interface/IIssueAIAnalysisRepository.js";
import type { IssueAIAnalysis } from "../../domain/entities/IssueAIAnalysis.js";
import { IssueAIAnalysisModel } from "../models/IssueAIAnalysisModel.js";
import { IssueAIAnalysisMapper } from "../mappers/IssueAIAnalysisMapper.js";
import { AIAnalysisStatus } from "../../domain/enums/AIAnalysisStatus.js";
import { AIOverallClassification } from "../../domain/enums/AIOverallClassification.js";

export class IssueAIAnalysisRepository implements IIssueAIAnalysisRepository {
    async findByIssueId(issueId: string): Promise<IssueAIAnalysis | null> {
        if (!Types.ObjectId.isValid(issueId)) {
            return null;
        }
        const doc = await IssueAIAnalysisModel.findOne({ issueId: new Types.ObjectId(issueId) });
        return doc ? IssueAIAnalysisMapper.toEntity(doc) : null;
    }

    async save(analysis: IssueAIAnalysis): Promise<IssueAIAnalysis> {
        const issueObjectId = new Types.ObjectId(analysis.issueId);
        const updatePayload: Record<string, unknown> = {
            status: analysis.status,
            cutoffDate: analysis.cutoffDate,
            totalEligibleComments: analysis.totalEligibleComments,
            supportCount: analysis.supportCount,
            challengeCount: analysis.challengeCount,
            neutralCount: analysis.neutralCount,
            score: analysis.score,
            overallClassification: analysis.overallClassification,
            summary: analysis.summary,
            commentClassifications: analysis.commentClassifications,
            modelUsed: analysis.modelUsed,
            completedAt: analysis.completedAt,
            errorMessage: analysis.errorMessage,
        };

        const updated = await IssueAIAnalysisModel.findOneAndUpdate(
            { issueId: issueObjectId },
            { $set: updatePayload },
            { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
        );

        return IssueAIAnalysisMapper.toEntity(updated);
    }

    async acquireProcessingLock(
        issueId: string,
        cutoffDate: Date
    ): Promise<{ acquired: boolean; analysis: IssueAIAnalysis | null }> {
        if (!Types.ObjectId.isValid(issueId)) {
            return { acquired: false, analysis: null };
        }
        const issueObjectId = new Types.ObjectId(issueId);

        // 1. Check existing record
        const existing = await IssueAIAnalysisModel.findOne({ issueId: issueObjectId });
        if (existing) {
            // If already COMPLETED or INSUFFICIENT_DATA, return existing
            if (
                existing.status === AIAnalysisStatus.COMPLETED ||
                existing.status === AIAnalysisStatus.INSUFFICIENT_DATA
            ) {
                return { acquired: false, analysis: IssueAIAnalysisMapper.toEntity(existing) };
            }

            // If currently PROCESSING and not stale (under 3 minutes old), avoid duplicate work
            const isRecentProcessing =
                existing.status === AIAnalysisStatus.PROCESSING &&
                Date.now() - new Date(existing.updatedAt).getTime() < 3 * 60 * 1000;

            if (isRecentProcessing) {
                return { acquired: false, analysis: IssueAIAnalysisMapper.toEntity(existing) };
            }

            // Transition from PENDING, FAILED, or stale PROCESSING to PROCESSING atomically
            const updated = await IssueAIAnalysisModel.findOneAndUpdate(
                {
                    issueId: issueObjectId,
                    $or: [
                        { status: AIAnalysisStatus.PENDING },
                        { status: AIAnalysisStatus.FAILED },
                        {
                            status: AIAnalysisStatus.PROCESSING,
                            updatedAt: { $lt: new Date(Date.now() - 3 * 60 * 1000) },
                        },
                    ],
                },
                {
                    $set: {
                        status: AIAnalysisStatus.PROCESSING,
                        cutoffDate,
                        errorMessage: null,
                    },
                },
                { returnDocument: "after" }
            );

            if (updated) {
                return { acquired: true, analysis: IssueAIAnalysisMapper.toEntity(updated) };
            }

            // Lost race condition; return latest state
            const latest = await IssueAIAnalysisModel.findOne({ issueId: issueObjectId });
            return { acquired: false, analysis: latest ? IssueAIAnalysisMapper.toEntity(latest) : null };
        }

        // 2. No record exists yet: atomically insert in PROCESSING status
        try {
            const created = await IssueAIAnalysisModel.create({
                issueId: issueObjectId,
                status: AIAnalysisStatus.PROCESSING,
                cutoffDate,
                overallClassification: AIOverallClassification.INSUFFICIENT_DATA,
                totalEligibleComments: 0,
                supportCount: 0,
                challengeCount: 0,
                neutralCount: 0,
                score: null,
                summary: "",
                commentClassifications: [],
            });
            return { acquired: true, analysis: IssueAIAnalysisMapper.toEntity(created) };
        } catch (_err: unknown) {
            // If unique constraint duplicate key race occurred, fetch latest
            const duplicate = await IssueAIAnalysisModel.findOne({ issueId: issueObjectId });
            return { acquired: false, analysis: duplicate ? IssueAIAnalysisMapper.toEntity(duplicate) : null };
        }
    }

    async markFailed(issueId: string, errorMessage: string): Promise<IssueAIAnalysis | null> {
        if (!Types.ObjectId.isValid(issueId)) {
            return null;
        }
        const updated = await IssueAIAnalysisModel.findOneAndUpdate(
            { issueId: new Types.ObjectId(issueId) },
            {
                $set: {
                    status: AIAnalysisStatus.FAILED,
                    errorMessage,
                },
            },
            { returnDocument: "after" }
        );
        return updated ? IssueAIAnalysisMapper.toEntity(updated) : null;
    }
}
export default IssueAIAnalysisRepository;
