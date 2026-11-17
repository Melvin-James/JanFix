import { Types } from "mongoose";

import type { IGetProposalsForIssueUseCase } from "../usecase interfaces/admin/IGetProposalsForIssueUseCase.js";

import type { IIssueRepository } from "../../../domain/interface/IIssueRepository.js";

import type { IProposalRepository } from "../../../domain/interface/IProposalRepository.js";

import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";

import type { IStorageService } from "../../services/IStorageService.js";

import type {
    AdminIssueProposalsComparisonResponseDTO,
    ProposalComparisonCardDTO,
} from "../../dto/admin/AdminIssueProposalsComparisonResponseDTO.js";

import { IssueAppMapper } from "../../mappers/IssueAppMapper.js";

import { ProposalAppMapper } from "../../mappers/ProposalAppMapper.js";

import { refreshUploadedFileUrls } from "../../services/refreshUploadedFileUrls.js";

import ApiError from "../../../shared/utils/apiError.js";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

export class GetProposalsForIssueUseCase implements IGetProposalsForIssueUseCase {
    constructor(
        private readonly issueRepository: IIssueRepository,
        private readonly proposalRepository: IProposalRepository,
        private readonly userRepository: IUserRepository,
        private readonly storageService: IStorageService
    ) {}

    async execute(issueId: string): Promise<AdminIssueProposalsComparisonResponseDTO> {
        if (!issueId || !Types.ObjectId.isValid(issueId)) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "Invalid issue ID format");
        }

        const issue = await this.issueRepository.findById(issueId);
        if (!issue) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, "Issue not found");
        }

        const proposals = await this.proposalRepository.findSubmittedByIssueId(issueId);
        const urlCache = new Map<string, string>();

        const issueResponse = IssueAppMapper.toResponse(issue);
        const refreshedIssueImages = await refreshUploadedFileUrls(
            issueResponse.images,
            this.storageService,
            urlCache
        );

        // Fetch user documents for providers
        const providerIds = [...new Set(proposals.map((p) => p.providerId))];

        const providers = await this.userRepository.findByIds(providerIds);

        const providerMap = new Map<string, (typeof providers)[0]>();
        for (const u of providers) {
            if (u && u.id) {
                providerMap.set(u.id, u);
            }
        }

        const proposalCards: ProposalComparisonCardDTO[] = await Promise.all(
            proposals.map(async (p) => {
                const baseDTO = ProposalAppMapper.toResponse(p);
                const user = providerMap.get(p.providerId);

                let providerAvatarUrl: string | undefined;
                const profileImg = user?.providerProfile?.documents?.profileImage;
                const logoImg = user?.providerProfile?.documents?.logo;
                const targetImg = profileImg || logoImg;

                if (targetImg) {
                    if (targetImg.key) {
                        if (urlCache.has(targetImg.key)) {
                            providerAvatarUrl = urlCache.get(targetImg.key);
                        } else {
                            try {
                                providerAvatarUrl = await this.storageService.getPresignedUrl(targetImg.key);
                                urlCache.set(targetImg.key, providerAvatarUrl);
                            } catch {
                                providerAvatarUrl = targetImg.url;
                            }
                        }
                    } else {
                        providerAvatarUrl = targetImg.url;
                    }
                }

                const providerName =
                    user?.providerProfile?.identity?.providerName || user?.fullName || "Service Provider";
                const providerType = p.providerType;
                const providerPhone = user?.providerProfile?.identity?.phone;
                const providerAddress = user?.providerProfile?.identity?.address;
                const providerApplicationStatus = user?.providerProfile?.status?.applicationStatus;
                const providerMemberCount =
                    user?.providerProfile?.organizationProfile?.memberCount ||
                    user?.providerProfile?.volunteerGroupProfile?.memberCount;

                return {
                    ...baseDTO,
                    proposalId: p.id || baseDTO.id,
                    providerName,
                    providerType,
                    providerAvatarUrl,
                    providerPhone,
                    providerAddress,
                    providerApplicationStatus,
                    providerMemberCount,
                    durationHours: p.estimatedDurationHours,
                    teamSize: p.estimatedTeamSize,
                    totalBudget: p.totalBudgetPaise / 100,
                };
            })
        );

        return {
            issue: {
                ...issueResponse,
                images: refreshedIssueImages,
            },
            proposals: proposalCards,
            proposalCount: proposalCards.length,
        };
    }
}

export default GetProposalsForIssueUseCase;

