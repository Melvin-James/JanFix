import type { Proposal } from "../../domain/entities/Proposal.js";
import type { ProposalResponseDTO } from "../dto/proposal/ProposalResponseDTO.js";

export class ProposalAppMapper {
    static toResponse(proposal: Proposal): ProposalResponseDTO {
        return {
            id: proposal.id || "",
            issueId: proposal.issueId,
            providerId: proposal.providerId,
            providerType: proposal.providerType,
            status: proposal.status,
            issueSnapshot: {
                title: proposal.issueSnapshot.title,
                description: proposal.issueSnapshot.description,
            },
            estimatedTeamSize: proposal.estimatedTeamSize,
            estimatedDurationHours: proposal.estimatedDurationHours,
            expectedStartDate: proposal.expectedStartDate instanceof Date
                ? proposal.expectedStartDate.toISOString()
                : String(proposal.expectedStartDate),
            budgetItems: proposal.budgetItems.map((item) => ({
                id: item.id,
                heading: item.heading,
                amountPaise: item.amountPaise,
                amountRupees: item.amountPaise / 100,
            })),
            totalBudgetPaise: proposal.totalBudgetPaise,
            totalBudgetRupees: proposal.totalBudgetPaise / 100,
            executionRoadmap: proposal.executionRoadmap.map((item) => ({
                id: item.id,
                heading: item.heading,
                description: item.description,
                startTime: item.startTime,
                endTime: item.endTime,
                order: item.order,
            })),
            ngoDetails: proposal.ngoDetails
                ? {
                    requiresFunding: proposal.ngoDetails.requiresFunding,
                    participationMode: proposal.ngoDetails.participationMode,
                    expectedParticipants: proposal.ngoDetails.expectedParticipants,
                    requiresCommunityChat: proposal.ngoDetails.requiresCommunityChat,
                }
                : undefined,
            submittedAt: proposal.submittedAt instanceof Date
                ? proposal.submittedAt.toISOString()
                : String(proposal.submittedAt),
            withdrawnAt: proposal.withdrawnAt
                ? proposal.withdrawnAt instanceof Date
                    ? proposal.withdrawnAt.toISOString()
                    : String(proposal.withdrawnAt)
                : undefined,
            createdAt: proposal.createdAt
                ? proposal.createdAt instanceof Date
                    ? proposal.createdAt.toISOString()
                    : String(proposal.createdAt)
                : undefined,
            updatedAt: proposal.updatedAt
                ? proposal.updatedAt instanceof Date
                    ? proposal.updatedAt.toISOString()
                    : String(proposal.updatedAt)
                : undefined,
        };
    }
}

