import type { Document } from "mongoose";
import type { Proposal } from "../../domain/entities/Proposal.js";
import type { ProposalDocument } from "../models/ProposalModel.js";

export class ProposalMapper {
    static toEntity(doc: Document): Proposal {
        const document = doc as ProposalDocument;
        return {
            id: document._id.toString(),
            issueId: document.issueId.toString(),
            providerId: document.providerId.toString(),
            providerType: document.providerType,
            status: document.status,
            issueSnapshot: {
                title: document.issueSnapshot.title,
                description: document.issueSnapshot.description,
            },
            estimatedTeamSize: document.estimatedTeamSize,
            estimatedDurationHours: document.estimatedDurationHours,
            expectedStartDate: document.expectedStartDate,
            budgetItems: (document.budgetItems || []).map((item) => ({
                id: item._id ? item._id.toString() : undefined,
                heading: item.heading,
                amountPaise: item.amountPaise,
            })),
            totalBudgetPaise: document.totalBudgetPaise,
            executionRoadmap: (document.executionRoadmap || []).map((item) => ({
                id: item._id ? item._id.toString() : undefined,
                heading: item.heading,
                description: item.description,
                startTime: item.startTime,
                endTime: item.endTime,
                order: item.order,
            })),
            ngoDetails: document.ngoDetails
                ? {
                    requiresFunding: document.ngoDetails.requiresFunding,
                    participationMode: document.ngoDetails.participationMode,
                    expectedParticipants: document.ngoDetails.expectedParticipants,
                    requiresCommunityChat: document.ngoDetails.requiresCommunityChat,
                }
                : undefined,
            submittedAt: document.submittedAt,
            withdrawnAt: document.withdrawnAt,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
        };
    }
}

