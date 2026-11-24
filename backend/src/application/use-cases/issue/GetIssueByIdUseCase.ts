import type { IIssueRepository } from "../../../domain/interface/IIssueRepository.ts";
import type { IProposalRepository } from "../../../domain/interface/IProposalRepository.ts";
import type { IUserRepository } from "../../../domain/interface/IUserRepository.ts";
import type {
    IssueResponseDTO,
    PublicSelectedProposalDTO,
    PublicProviderProfileDTO,
    IssueTimelineEventDTO,
} from "../../dto/issue/IssueResponseDTO.ts";
import type { Issue } from "../../../domain/entities/Issue.ts";
import type { IGetIssueByIdUseCase } from "../usecase interfaces/issue/IGetIssueByIdUseCase.ts";
import { IssueAppMapper } from "../../mappers/IssueAppMapper.ts";
import ApiError from "../../../shared/utils/apiError.ts";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.ts";
import { IssueVisibility } from "../../../domain/enums/IssueVisibility.ts";
import { IssueStatus } from "../../../domain/enums/IssueStatus.ts";
import { ProposalFundingType } from "../../../domain/enums/ProposalFundingType.ts";
import type { IStorageService } from "../../services/IStorageService.ts";
import { refreshUploadedFileUrls } from "../../services/refreshUploadedFileUrls.ts";
import { Role } from "../../../domain/enums/Role.ts";

function buildTimelineEvents(issue: Issue): IssueTimelineEventDTO[] {
    const isNgoOwn = issue.fundingSnapshot?.fundingType === ProposalFundingType.NGO_OWN_FUNDING;
    const stages: Array<{ status: IssueStatus; title: string; description: string }> = [
        {
            status: IssueStatus.REPORTED,
            title: "Issue Reported",
            description: "Civic concern submitted by community reporter.",
        },
        {
            status: IssueStatus.VERIFIED,
            title: "Verified by Moderation",
            description: "Issue reviewed, approved, and opened for provider proposals.",
        },
        isNgoOwn
            ? {
                status: IssueStatus.PLANNED,
                title: "Execution Planned",
                description: "Proposal selected; project scheduled for NGO execution.",
            }
            : {
                status: IssueStatus.FUNDRAISING,
                title: "Community Fundraising",
                description: "Proposal selected; civic fundraising initiated.",
            },
        {
            status: IssueStatus.ONGOING,
            title: "Work In Progress",
            description: "Provider actively executing the roadmap on-site.",
        },
        {
            status: IssueStatus.COMPLETED,
            title: "Civic Resolution Completed",
            description: "All planned tasks completed and verified.",
        },
    ];

    const currentStatus = issue.status;
    const statusIndexMap: Record<string, number> = {
        [IssueStatus.REPORTED]: 0,
        [IssueStatus.VERIFIED]: 1,
        [IssueStatus.FUNDRAISING]: 2,
        [IssueStatus.PLANNED]: 2,
        [IssueStatus.ONGOING]: 3,
        [IssueStatus.COMPLETED]: 4,
    };
    const currentIndex = statusIndexMap[currentStatus] ?? 0;

    return stages.map((stage, idx) => {
        let timestamp: string | undefined = undefined;
        if (stage.status === IssueStatus.REPORTED && issue.createdAt) {
            timestamp = issue.createdAt.toISOString();
        } else if (stage.status === IssueStatus.VERIFIED && (issue.proposalOpenedAt || issue.updatedAt)) {
            timestamp = (issue.proposalOpenedAt || issue.updatedAt)?.toISOString();
        } else if (
            (stage.status === IssueStatus.FUNDRAISING || stage.status === IssueStatus.PLANNED) &&
            issue.proposalSelectedAt
        ) {
            timestamp = issue.proposalSelectedAt.toISOString();
        }

        return {
            status: stage.status,
            title: stage.title,
            description: stage.description,
            timestamp,
            isCompleted: idx < currentIndex || (idx === currentIndex && currentStatus === IssueStatus.COMPLETED),
            isCurrent: idx === currentIndex && currentStatus !== IssueStatus.COMPLETED,
        };
    });
}

export class GetIssueByIdUseCase implements IGetIssueByIdUseCase {
    constructor(
        private readonly _issueRepository: IIssueRepository,
        private readonly _storageService: IStorageService,
        private readonly _proposalRepository?: IProposalRepository,
        private readonly _userRepository?: IUserRepository
    ) {}

    async execute(
        issueId: string,
        requestingUserId?: string,
        requestingUserRoles?: Role[]
    ): Promise<IssueResponseDTO> {
        const issue = await this._issueRepository.findById(issueId);
        if (!issue) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, "Issue not found");
        }

        const isCreator = Boolean(requestingUserId && issue.createdBy === requestingUserId);
        const isAdmin = Boolean(requestingUserRoles?.includes(Role.ADMIN));

        // Approved/Post-approval private issues are restricted to the original reporter
        // and authorized administrators
        const isPostApprovalPrivateIssue =
            issue.visibility === IssueVisibility.PRIVATE &&
            issue.status !== IssueStatus.REPORTED &&
            issue.status !== IssueStatus.REJECTED;

        if (isPostApprovalPrivateIssue && !isCreator && !isAdmin) {
            throw new ApiError(HttpStatusCode.FORBIDDEN, "You do not have permission to view this private issue");
        }

        // Rejected issues are restricted to the original reporter and authorized administrators
        if (issue.status === IssueStatus.REJECTED && !isCreator && !isAdmin) {
            throw new ApiError(HttpStatusCode.FORBIDDEN, "You do not have permission to view this rejected issue");
        }

        let selectedProposalDTO: PublicSelectedProposalDTO | undefined = undefined;
        let selectedProviderDTO: PublicProviderProfileDTO | undefined = undefined;

        if (issue.selectedProposalId && this._proposalRepository) {
            const proposal = await this._proposalRepository.findById(issue.selectedProposalId);
            if (proposal) {
                selectedProposalDTO = {
                    id: proposal.id || "",
                    estimatedTeamSize: proposal.estimatedTeamSize,
                    estimatedDurationHours: proposal.estimatedDurationHours,
                    fundingType: proposal.fundingType || ProposalFundingType.COMMUNITY_FUNDING,
                    budgetItems: (proposal.budgetItems || []).map((b) => ({
                        id: b.id,
                        heading: b.heading,
                        amountPaise: b.amountPaise,
                        amountRupees: b.amountPaise / 100,
                    })),
                    totalBudgetPaise: proposal.totalBudgetPaise,
                    totalBudgetRupees: proposal.totalBudgetPaise / 100,
                    executionRoadmap: (proposal.executionRoadmap || []).map((r) => ({
                        id: r.id,
                        heading: r.heading,
                        description: r.description,
                        startTime: r.startTime,
                        endTime: r.endTime,
                        order: r.order,
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
                };

                if (this._userRepository) {
                    const providerUser = await this._userRepository.findById(proposal.providerId);
                    if (providerUser) {
                        let profileImageUrl: string | undefined = undefined;
                        let logoUrl: string | undefined = undefined;
                        const communityPhotoUrls: string[] = [];

                        if (providerUser.providerProfile?.documents?.profileImage?.key) {
                            profileImageUrl = await this._storageService.getPresignedUrl(
                                providerUser.providerProfile.documents.profileImage.key
                            );
                        }
                        if (providerUser.providerProfile?.documents?.logo?.key) {
                            logoUrl = await this._storageService.getPresignedUrl(
                                providerUser.providerProfile.documents.logo.key
                            );
                        }
                        if (Array.isArray(providerUser.providerProfile?.documents?.previousCommunityPhotos)) {
                            for (const photo of providerUser.providerProfile.documents.previousCommunityPhotos) {
                                if (photo?.key) {
                                    communityPhotoUrls.push(await this._storageService.getPresignedUrl(photo.key));
                                }
                            }
                        }

                        const organizationName = providerUser.providerProfile?.identity?.providerName;
                        const teamSize = providerUser.providerProfile?.organizationProfile?.memberCount ||
                            providerUser.providerProfile?.volunteerGroupProfile?.memberCount;

                        selectedProviderDTO = {
                            id: providerUser.id || "",
                            fullName: providerUser.fullName,
                            providerType: providerUser.providerProfile?.identity?.providerType || proposal.providerType,
                            organizationName,
                            bio: undefined,
                            profileImage: profileImageUrl,
                            logo: logoUrl,
                            teamSize,
                            communityPhotos: communityPhotoUrls,
                        };
                    }
                }
            }
        }

        const timelineEvents = buildTimelineEvents(issue);
        
        const response = IssueAppMapper.toResponse(issue, {
            includeRejectionReason: isCreator || isAdmin,
        });

        return {
            ...response,
            images: await refreshUploadedFileUrls(response.images, this._storageService),
            selectedProposal: selectedProposalDTO,
            selectedProvider: selectedProviderDTO,
            timelineEvents,
        };
    }
}
