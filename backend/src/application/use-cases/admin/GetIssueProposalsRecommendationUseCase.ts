import { Types } from "mongoose";
import type { IGetIssueProposalsRecommendationUseCase } from "../usecase interfaces/admin/IGetIssueProposalsRecommendationUseCase.js";
import type { IIssueRepository } from "../../../domain/interface/IIssueRepository.js";
import type { IProposalRepository } from "../../../domain/interface/IProposalRepository.js";
import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";
import type { IProposalAIAnalysisRepository } from "../../../infrastructure/repositories/ProposalAIAnalysisRepository.js";
import type { IProposalAIService, ProposalAIComparisonItem, IssueAIContext } from "../../../domain/interface/IProposalAIService.js";
import type { AdminProposalAIRecommendationResponseDTO } from "../../dto/admin/AdminProposalAIRecommendationResponseDTO.js";
import ApiError from "../../../shared/utils/apiError.js";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

export class GetIssueProposalsRecommendationUseCase implements IGetIssueProposalsRecommendationUseCase {
    constructor(
        private readonly issueRepository: IIssueRepository,
        private readonly proposalRepository: IProposalRepository,
        private readonly userRepository: IUserRepository,
        private readonly proposalAIAnalysisRepository: IProposalAIAnalysisRepository,
        private readonly proposalAIService: IProposalAIService
    ) {}

    async execute(issueId: string, forceRefresh = false): Promise<AdminProposalAIRecommendationResponseDTO> {
        if (!issueId || !Types.ObjectId.isValid(issueId)) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "Invalid issue ID format");
        }

        const issue = await this.issueRepository.findById(issueId);
        if (!issue) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, "Issue not found");
        }

        const proposals = await this.proposalRepository.findSubmittedByIssueId(issueId);
        if (proposals.length === 0) {
            return {
                issueId,
                recommendedProposalId: null,
                recommendedProviderName: null,
                recommendationReason: "No submitted proposals are available yet for this issue.",
                keyStrengths: [],
                keyConcerns: [],
                tradeOffs: [],
                proposalsAnalyzedCount: 0,
                modelUsed: "none",
                completedAt: new Date().toISOString(),
            };
        }

        // Determine latest proposal update time
        const latestProposalUpdatedAt = proposals.reduce((latest, p) => {
            const pDate = p.updatedAt || p.submittedAt || new Date(0);
            return pDate > latest ? pDate : latest;
        }, new Date(0));

        // Check cache unless forceRefresh requested
        if (!forceRefresh) {
            const cached = await this.proposalAIAnalysisRepository.getIssueRecommendation(issueId);
            if (
                cached &&
                cached.proposalsAnalyzedCount === proposals.length &&
                cached.lastProposalsUpdatedAt.getTime() >= latestProposalUpdatedAt.getTime()
            ) {
                return {
                    issueId,
                    recommendedProposalId: cached.recommendedProposalId ? cached.recommendedProposalId.toString() : null,
                    recommendedProviderName: cached.recommendedProviderName || null,
                    recommendationReason: cached.recommendationReason,
                    keyStrengths: cached.keyStrengths || [],
                    keyConcerns: cached.keyConcerns || [],
                    tradeOffs: cached.tradeOffs || [],
                    proposalsAnalyzedCount: cached.proposalsAnalyzedCount,
                    modelUsed: cached.modelUsed,
                    completedAt: cached.completedAt.toISOString(),
                };
            }
        }

        // Prepare provider lookup
        const providerIds = [...new Set(proposals.map((p) => p.providerId))];
        const providers = await Promise.all(providerIds.map((id) => this.userRepository.findById(id)));
        const providerMap = new Map<string, (typeof providers)[0]>();
        for (const u of providers) {
            if (u && u.id) {
                providerMap.set(u.id, u);
            }
        }

        const comparisonItems: ProposalAIComparisonItem[] = proposals.map((p) => {
            const user = providerMap.get(p.providerId);
            const providerName = user?.providerProfile?.identity?.providerName || user?.fullName || "Service Provider";
            const memberCount =
                user?.providerProfile?.organizationProfile?.memberCount ||
                user?.providerProfile?.volunteerGroupProfile?.memberCount;

            return {
                proposalId: p.id || "",
                providerId: p.providerId,
                providerName,
                providerType: p.providerType,
                memberCount,
                estimatedTeamSize: p.estimatedTeamSize,
                estimatedDurationHours: p.estimatedDurationHours,
                totalBudgetRupees: Math.round(p.totalBudgetPaise / 100),
                budgetItems: p.budgetItems.map((b) => ({
                    heading: b.heading,
                    amountRupees: Math.round(b.amountPaise / 100),
                })),
                executionRoadmap: p.executionRoadmap.map((r) => ({
                    heading: r.heading,
                    description: r.description,
                    startTime: r.startTime,
                    endTime: r.endTime,
                })),
                ngoDetails: p.ngoDetails
                    ? {
                          requiresFunding: p.ngoDetails.requiresFunding,
                          participationMode: p.ngoDetails.participationMode,
                          expectedParticipants: p.ngoDetails.expectedParticipants,
                          requiresCommunityChat: p.ngoDetails.requiresCommunityChat,
                      }
                    : undefined,
            };
        });

        const issueContext: IssueAIContext = {
            id: issue.id || issueId,
            title: issue.title,
            description: issue.description,
            categoryName: issue.categoryName,
            locationAddress: issue.location?.address,
        };

        const aiResult = await this.proposalAIService.generateIssueProposalRecommendation(
            issueContext,
            comparisonItems
        );

        // Save to cache
        await this.proposalAIAnalysisRepository.saveIssueRecommendation({
            issueId,
            proposalsAnalyzedCount: proposals.length,
            lastProposalsUpdatedAt: latestProposalUpdatedAt,
            recommendedProposalId: aiResult.recommendedProposalId || undefined,
            recommendedProviderName: aiResult.recommendedProviderName || undefined,
            recommendationReason: aiResult.recommendationReason,
            keyStrengths: aiResult.keyStrengths,
            keyConcerns: aiResult.keyConcerns,
            tradeOffs: aiResult.tradeOffs,
            modelUsed: aiResult.modelUsed,
        } as never);

        return {
            issueId,
            recommendedProposalId: aiResult.recommendedProposalId,
            recommendedProviderName: aiResult.recommendedProviderName,
            recommendationReason: aiResult.recommendationReason,
            keyStrengths: aiResult.keyStrengths,
            keyConcerns: aiResult.keyConcerns,
            tradeOffs: aiResult.tradeOffs,
            proposalsAnalyzedCount: proposals.length,
            modelUsed: aiResult.modelUsed,
            completedAt: new Date().toISOString(),
        };
    }
}

export default GetIssueProposalsRecommendationUseCase;

