import { Types } from "mongoose";
import type { IGetAdminProposalDetailsUseCase } from "../usecase interfaces/admin/IGetAdminProposalDetailsUseCase.js";
import type { IIssueRepository } from "../../../domain/interface/IIssueRepository.js";
import type { IProposalRepository } from "../../../domain/interface/IProposalRepository.js";
import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";
import type { IStorageService } from "../../services/IStorageService.js";
import type { AdminProposalDetailsResponseDTO } from "../../dto/admin/AdminProposalDetailsResponseDTO.js";
import { IssueAppMapper } from "../../mappers/IssueAppMapper.js";
import { ProposalAppMapper } from "../../mappers/ProposalAppMapper.js";
import { ServiceProviderDetailsMapper } from "../../mappers/ServiceProviderDetailsMapper.js";
import { refreshUploadedFileUrls, refreshProviderDocuments } from "../../services/refreshUploadedFileUrls.js";
import ApiError from "../../../shared/utils/apiError.js";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

export class GetAdminProposalDetailsUseCase implements IGetAdminProposalDetailsUseCase {
    constructor(
        private readonly issueRepository: IIssueRepository,
        private readonly proposalRepository: IProposalRepository,
        private readonly userRepository: IUserRepository,
        private readonly storageService: IStorageService
    ) {}

    async execute(issueId: string, proposalId: string): Promise<AdminProposalDetailsResponseDTO> {
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

        const providerUser = await this.userRepository.findById(proposal.providerId);
        if (!providerUser || !providerUser.providerProfile) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, "Provider account not found");
        }

        const urlCache = new Map<string, string>();

        const issueResponse = IssueAppMapper.toResponse(issue);
        const refreshedIssueImages = await refreshUploadedFileUrls(
            issueResponse.images,
            this.storageService,
            urlCache
        );

        const refreshedDocuments = await refreshProviderDocuments(
            providerUser.providerProfile.documents,
            this.storageService,
            urlCache,
            { includeSensitive: true }
        );

        const userWithRefreshedDocs = {
            ...providerUser,
            providerProfile: {
                ...providerUser.providerProfile,
                documents: refreshedDocuments,
            },
        };

        const providerDTO = ServiceProviderDetailsMapper.toResponse(userWithRefreshedDocs);
        const proposalDTO = ProposalAppMapper.toResponse(proposal);

        return {
            proposal: proposalDTO,
            issue: {
                ...issueResponse,
                images: refreshedIssueImages,
            },
            provider: providerDTO,
        };
    }
}

export default GetAdminProposalDetailsUseCase;

