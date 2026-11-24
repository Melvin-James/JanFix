import { Types } from "mongoose";
import type { IGetAdminProposalDetailsUseCase } from "../usecase interfaces/admin/IGetAdminProposalDetailsUseCase.ts";
import type { IIssueRepository } from "../../../domain/interface/IIssueRepository.ts";
import type { IProposalRepository } from "../../../domain/interface/IProposalRepository.ts";
import type { IUserRepository } from "../../../domain/interface/IUserRepository.ts";
import type { IStorageService } from "../../services/IStorageService.ts";
import type { AdminProposalDetailsResponseDTO } from "../../dto/admin/AdminProposalDetailsResponseDTO.ts";
import { IssueAppMapper } from "../../mappers/IssueAppMapper.ts";
import { ProposalAppMapper } from "../../mappers/ProposalAppMapper.ts";
import { ServiceProviderDetailsMapper } from "../../mappers/ServiceProviderDetailsMapper.ts";
import { refreshUploadedFileUrls, refreshProviderDocuments } from "../../services/refreshUploadedFileUrls.ts";
import ApiError from "../../../shared/utils/apiError.ts";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.ts";

export class GetAdminProposalDetailsUseCase implements IGetAdminProposalDetailsUseCase {
    constructor(
        private readonly _issueRepository: IIssueRepository,
        private readonly _proposalRepository: IProposalRepository,
        private readonly _userRepository: IUserRepository,
        private readonly _storageService: IStorageService
    ) {}

    async execute(issueId: string, proposalId: string): Promise<AdminProposalDetailsResponseDTO> {
        if (!issueId || !Types.ObjectId.isValid(issueId)) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "Invalid issue ID format");
        }
        if (!proposalId || !Types.ObjectId.isValid(proposalId)) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "Invalid proposal ID format");
        }

        const [issue, proposal] = await Promise.all([
            this._issueRepository.findById(issueId),
            this._proposalRepository.findByIdAndIssueId(proposalId, issueId),
        ]);

        if (!issue) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, "Issue not found");
        }

        if (!proposal) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, "Proposal not found for this issue");
        }

        const providerUser = await this._userRepository.findById(proposal.providerId);
        if (!providerUser || !providerUser.providerProfile) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, "Provider account not found");
        }

        const urlCache = new Map<string, string>();

        const issueResponse = IssueAppMapper.toResponse(issue);
        const refreshedIssueImages = await refreshUploadedFileUrls(
            issueResponse.images,
            this._storageService,
            urlCache
        );

        const refreshedDocuments = await refreshProviderDocuments(
            providerUser.providerProfile.documents,
            this._storageService,
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

