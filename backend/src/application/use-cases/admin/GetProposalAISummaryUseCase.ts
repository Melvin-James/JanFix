import { Types } from "mongoose";
import type { IGetProposalAISummaryUseCase } from "../usecase interfaces/admin/IGetProposalAISummaryUseCase.js";
import type { IIssueRepository } from "../../../domain/interface/IIssueRepository.js";
import type { IProposalRepository } from "../../../domain/interface/IProposalRepository.js";
import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";
import type { IProposalAIAnalysisRepository } from "../../../infrastructure/repositories/ProposalAIAnalysisRepository.js";
import type { IProposalAIService, ProposalAIComparisonItem, IssueAIContext } from "../../../domain/interface/IProposalAIService.js";
import type { AdminProposalAISummaryResponseDTO } from "../../dto/admin/AdminProposalAISummaryResponseDTO.js";
import ApiError from "../../../shared/utils/apiError.js";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

export class GetProposalAISummaryUseCase implements IGetProposalAISummaryUseCase {
    constructor(
        private readonly issueRepository: IIssueRepository,
        private readonly proposalRepository: IProposalRepository,
        private readonly userRepository: IUserRepository,
        private readonly proposalAIAnalysisRepository: IProposalAIAnalysisRepository,
        private readonly proposalAIService: IProposalAIService
    ) {}

    async execute(issueId: string, proposalId: string, forceRefresh = false): Promise<AdminProposalAISummaryResponseDTO> {
        if (!issueId || !Types.ObjectId.isValid(issueId)) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "Invalid issue ID format");
        }
        if (!proposalId || !Types.ObjectId.isValid(proposalId)) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "Invalid proposal ID format");
        }

        const [issue, proposal] = await Promise.all([
            this.issueRepository.findById(issueId),
            this.proposalRepository.findByIdAndIssueId(proposalId, issueId),
        ]);

        if (!issue) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, "Issue not found");
        }
        if (!proposal) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, "Proposal not found for this issue");
        }

        const proposalUpdatedAt = proposal.updatedAt || proposal.submittedAt || new Date();

        // Check cache unless forceRefresh requested
        if (!forceRefresh) {
            const cached = await this.proposalAIAnalysisRepository.getIndividualSummary(proposalId);
            if (cached && cached.proposalUpdatedAt.getTime() >= proposalUpdatedAt.getTime()) {
                return {
                    proposalId,
                    issueId,
                    executiveSummary: cached.executiveSummary,
                    solutionApproach: cached.solutionApproach,
                    workforceAndSchedule: cached.workforceAndSchedule,
                    budgetAssessment: cached.budgetAssessment,
                    keyStrengths: cached.keyStrengths || [],
                    potentialConcerns: cached.potentialConcerns || [],
                    unclearOrMissingInformation: cached.unclearOrMissingInformation || [],
                    modelUsed: cached.modelUsed,
                    completedAt: cached.completedAt.toISOString(),
                };
            }
        }

        const providerUser = await this.userRepository.findById(proposal.providerId);
        const providerName =
            providerUser?.providerProfile?.identity?.providerName || providerUser?.fullName || "Service Provider";
        const memberCount =
            providerUser?.providerProfile?.organizationProfile?.memberCount ||
            providerUser?.providerProfile?.volunteerGroupProfile?.memberCount;

        const proposalItem: ProposalAIComparisonItem = {
            proposalId: proposal.id || proposalId,
            providerId: proposal.providerId,
            providerName,
            providerType: proposal.providerType,
            memberCount,
            estimatedTeamSize: proposal.estimatedTeamSize,
            estimatedDurationHours: proposal.estimatedDurationHours,
            totalBudgetRupees: Math.round(proposal.totalBudgetPaise / 100),
            budgetItems: proposal.budgetItems.map((b) => ({
                heading: b.heading,
                amountRupees: Math.round(b.amountPaise / 100),
            })),
            executionRoadmap: proposal.executionRoadmap.map((r) => ({
                heading: r.heading,
                description: r.description,
                startTime: r.startTime,
                endTime: r.endTime,
            })),
            ngoDetails: proposal.ngoDetails
                ? {
                      requiresFunding: proposal.ngoDetails.requiresFunding,
                      participationMode: proposal.ngoDetails.participationMode,
                      expectedParticipants: proposal.ngoDetails.expectedParticipants,
                      requiresCommunityChat: proposal.ngoDetails.requiresCommunityChat,
                  }
                : undefined,
        };

        const issueContext: IssueAIContext = {
            id: issue.id || issueId,
            title: issue.title,
            description: issue.description,
            categoryName: issue.categoryName,
            locationAddress: issue.location?.address,
        };

        const aiResult = await this.proposalAIService.generateIndividualProposalSummary(
            issueContext,
            proposalItem
        );

        // Save to cache
        await this.proposalAIAnalysisRepository.saveIndividualSummary({
            proposalId,
            issueId,
            proposalUpdatedAt,
            executiveSummary: aiResult.executiveSummary,
            solutionApproach: aiResult.solutionApproach,
            workforceAndSchedule: aiResult.workforceAndSchedule,
            budgetAssessment: aiResult.budgetAssessment,
            keyStrengths: aiResult.keyStrengths,
            potentialConcerns: aiResult.potentialConcerns,
            unclearOrMissingInformation: aiResult.unclearOrMissingInformation,
            modelUsed: aiResult.modelUsed,
        } as never);

        return {
            proposalId,
            issueId,
            executiveSummary: aiResult.executiveSummary,
            solutionApproach: aiResult.solutionApproach,
            workforceAndSchedule: aiResult.workforceAndSchedule,
            budgetAssessment: aiResult.budgetAssessment,
            keyStrengths: aiResult.keyStrengths,
            potentialConcerns: aiResult.potentialConcerns,
            unclearOrMissingInformation: aiResult.unclearOrMissingInformation,
            modelUsed: aiResult.modelUsed,
            completedAt: new Date().toISOString(),
        };
    }
}

export default GetProposalAISummaryUseCase;

