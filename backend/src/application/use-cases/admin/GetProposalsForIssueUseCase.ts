import { Types } from "mongoose";

import type { IGetProposalsForIssueUseCase } from "../usecase interfaces/admin/IGetProposalsForIssueUseCase.ts";

import type { IIssueRepository } from "../../../domain/interface/IIssueRepository.ts";

import type { IProposalRepository } from "../../../domain/interface/IProposalRepository.ts";

import type { IUserRepository } from "../../../domain/interface/IUserRepository.ts";

import type { IStorageService } from "../../services/IStorageService.ts";

import type {
    AdminIssueProposalsComparisonResponseDTO,
    ProposalComparisonCardDTO,
} from "../../dto/admin/AdminIssueProposalsComparisonResponseDTO.ts";

import { IssueAppMapper } from "../../mappers/IssueAppMapper.ts";

import { ProposalAppMapper } from "../../mappers/ProposalAppMapper.ts";

import { refreshUploadedFileUrls } from "../../services/refreshUploadedFileUrls.ts";

import ApiError from "../../../shared/utils/apiError.ts";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.ts";

export class GetProposalsForIssueUseCase implements IGetProposalsForIssueUseCase {
    constructor(
        private readonly _issueRepository: IIssueRepository,
        private readonly _proposalRepository: IProposalRepository,
        private readonly _userRepository: IUserRepository,
        private readonly _storageService: IStorageService
    ) {}

    async execute(issueId: string): Promise<AdminIssueProposalsComparisonResponseDTO> {
        if (!issueId || !Types.ObjectId.isValid(issueId)) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "Invalid issue ID format");
        }

        const issue = await this._issueRepository.findById(issueId);
        if (!issue) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, "Issue not found");
        }

        const proposals = await this._proposalRepository.findSubmittedByIssueId(issueId);
        const urlCache = new Map<string, string>();

        const issueResponse = IssueAppMapper.toResponse(issue);
        const refreshedIssueImages = await refreshUploadedFileUrls(
            issueResponse.images,
            this._storageService,
            urlCache
        );

        // Fetch user documents for providers
        const providerIds = [...new Set(proposals.map((p) => p.providerId))];

        const providers = await this._userRepository.findByIds(providerIds);

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
                                providerAvatarUrl = await this._storageService.getPresignedUrl(targetImg.key);
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

