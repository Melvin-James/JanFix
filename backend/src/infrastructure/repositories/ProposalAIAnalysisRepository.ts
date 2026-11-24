import { Types } from "mongoose";
import {
    IssueProposalRecommendationModel,
    IndividualProposalSummaryModel,
    type IssueProposalRecommendationDocument,
    type IndividualProposalSummaryDocument,
} from "../models/ProposalAIAnalysisModel.ts";

export interface IProposalAIAnalysisRepository {
    getIssueRecommendation(issueId: string): Promise<IssueProposalRecommendationDocument | null>;
    saveIssueRecommendation(
        data: Omit<IssueProposalRecommendationDocument, keyof Document | "createdAt" | "updatedAt">
    ): Promise<IssueProposalRecommendationDocument>;

    getIndividualSummary(proposalId: string): Promise<IndividualProposalSummaryDocument | null>;
    saveIndividualSummary(
        data: Omit<IndividualProposalSummaryDocument, keyof Document | "createdAt" | "updatedAt">
    ): Promise<IndividualProposalSummaryDocument>;
}

export class ProposalAIAnalysisRepository implements IProposalAIAnalysisRepository {
    async getIssueRecommendation(issueId: string): Promise<IssueProposalRecommendationDocument | null> {
        if (!Types.ObjectId.isValid(issueId)) return null;
        return await IssueProposalRecommendationModel.findOne({
            issueId: new Types.ObjectId(issueId),
        });
    }

    async saveIssueRecommendation(
        data: Record<string, unknown>
    ): Promise<IssueProposalRecommendationDocument> {
        const issueId = new Types.ObjectId(data.issueId as string | Types.ObjectId);
        const updateData: Record<string, unknown> = {
            ...data,
            issueId,
            ...(data.recommendedProposalId && Types.ObjectId.isValid(data.recommendedProposalId as string)
                ? { recommendedProposalId: new Types.ObjectId(data.recommendedProposalId as string) }
                : { recommendedProposalId: undefined }),
            completedAt: new Date(),
        };

        const doc = await IssueProposalRecommendationModel.findOneAndUpdate(
            { issueId },
            updateData,
            { upsert: true, returnDocument: "after", runValidators: true }
        );

        return doc!;
    }

    async getIndividualSummary(proposalId: string): Promise<IndividualProposalSummaryDocument | null> {
        if (!Types.ObjectId.isValid(proposalId)) return null;
        return await IndividualProposalSummaryModel.findOne({
            proposalId: new Types.ObjectId(proposalId),
        });
    }

    async saveIndividualSummary(
        data: Record<string, unknown>
    ): Promise<IndividualProposalSummaryDocument> {
        const proposalId = new Types.ObjectId(data.proposalId as string | Types.ObjectId);
        const issueId = new Types.ObjectId(data.issueId as string | Types.ObjectId);
        const updateData: Record<string, unknown> = {
            ...data,
            proposalId,
            issueId,
            completedAt: new Date(),
        };

        const doc = await IndividualProposalSummaryModel.findOneAndUpdate(
            { proposalId },
            updateData,
            { upsert: true, returnDocument: "after", runValidators: true }
        );

        return doc!;
    }
}

export default ProposalAIAnalysisRepository;

