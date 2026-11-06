import { Types } from "mongoose";
import type { IGetProviderProposalUseCase } from "../usecase interfaces/provider/IGetProviderProposalUseCase.js";
import type { IProposalRepository } from "../../../domain/interface/IProposalRepository.js";
import type { ProposalResponseDTO } from "../../dto/proposal/ProposalResponseDTO.js";
import { ProposalAppMapper } from "../../mappers/ProposalAppMapper.js";
import ApiError from "../../../shared/utils/apiError.js";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

export class GetProviderProposalUseCase implements IGetProviderProposalUseCase {
    constructor(private readonly proposalRepository: IProposalRepository) {}

    async execute(issueId: string, providerId: string): Promise<ProposalResponseDTO | null> {
        if (!issueId || !Types.ObjectId.isValid(issueId)) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "Invalid issue identifier");
        }
        if (!providerId || !Types.ObjectId.isValid(providerId)) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "Invalid provider identifier");
        }

        const proposal = await this.proposalRepository.findByIssueAndProvider(issueId, providerId);
        if (!proposal) {
            return null;
        }

        return ProposalAppMapper.toResponse(proposal);
    }
}

export default GetProviderProposalUseCase;

