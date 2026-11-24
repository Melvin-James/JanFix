import type { Issue } from "../../domain/entities/Issue.ts";
import type { IssueResponseDTO } from "../dto/issue/IssueResponseDTO.ts";

export interface IssueAppMapperOptions {
    includeRejectionReason?: boolean;
}

export class IssueAppMapper {
    static toResponse(issue: Issue, options?: IssueAppMapperOptions): IssueResponseDTO {
        return {
            id: issue.id || "",
            createdBy: issue.createdBy,
            reporterName: issue.reporterName,
            title: issue.title,
            description: issue.description,
            category: issue.category,
            categoryName: issue.categoryName,
            images: issue.images || [],
            visibility: issue.visibility,
            location: issue.location,
            status: issue.status,
            proposalOpenedAt: issue.proposalOpenedAt,
            proposalDeadlineAt: issue.proposalDeadlineAt,
            proposalWindowStatus: issue.proposalWindowStatus,
            selectedProposalId: issue.selectedProposalId,
            proposalSelectedAt: issue.proposalSelectedAt,
            fundingSnapshot: issue.fundingSnapshot
                ? {
                    fundingType: issue.fundingSnapshot.fundingType,
                    providerBudgetPaise: issue.fundingSnapshot.providerBudgetPaise,
                    providerBudgetRupees: issue.fundingSnapshot.providerBudgetPaise / 100,
                    platformFeeRatePercent: issue.fundingSnapshot.platformFeeRatePercent,
                    platformFeePaise: issue.fundingSnapshot.platformFeePaise,
                    platformFeeRupees: issue.fundingSnapshot.platformFeePaise / 100,
                    fundingTargetPaise: issue.fundingSnapshot.fundingTargetPaise,
                    fundingTargetRupees: issue.fundingSnapshot.fundingTargetPaise / 100,
                    amountRaisedPaise: issue.fundingSnapshot.amountRaisedPaise,
                    amountRaisedRupees: issue.fundingSnapshot.amountRaisedPaise / 100,
                    selectedProposalId: issue.fundingSnapshot.selectedProposalId,
                    selectedAt: issue.fundingSnapshot.selectedAt instanceof Date
                        ? issue.fundingSnapshot.selectedAt.toISOString()
                        : String(issue.fundingSnapshot.selectedAt),
                }
                : undefined,
            isCommunityIssue: Boolean(issue.isCommunityIssue),
            createdAt: issue.createdAt,
            updatedAt: issue.updatedAt,
            ...(options?.includeRejectionReason && issue.rejectionReason
                ? { rejectionReason: issue.rejectionReason }
                : {}),
        };
    }
}
