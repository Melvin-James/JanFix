import { Types } from "mongoose";
import type { IGetProviderProposalUseCase } from "../usecase interfaces/provider/IGetProviderProposalUseCase.ts";
import type { IProposalRepository } from "../../../domain/interface/IProposalRepository.ts";
import type { ProposalResponseDTO } from "../../dto/proposal/ProposalResponseDTO.ts";
import { ProposalAppMapper } from "../../mappers/ProposalAppMapper.ts";
import ApiError from "../../../shared/utils/apiError.ts";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.ts";

export class GetProviderProposalUseCase implements IGetProviderProposalUseCase {
    constructor(private readonly _proposalRepository: IProposalRepository) {}

    async execute(issueId: string, providerId: string): Promise<ProposalResponseDTO | null> {
        if (!issueId || !Types.ObjectId.isValid(issueId)) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "Invalid issue identifier");
        }
        if (!providerId || !Types.ObjectId.isValid(providerId)) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "Invalid provider identifier");
        }

        const proposal = await this._proposalRepository.findByIssueAndProvider(issueId, providerId);
        if (!proposal) {
            return null;
        }

        return ProposalAppMapper.toResponse(proposal);
    }
}

export default GetProviderProposalUseCase;

