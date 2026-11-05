import type { ProviderIssueResponseDTO } from "../../../dto/provider/ProviderIssueResponseDTO.js";

export interface IGetProviderIssueDetailsUseCase {
    execute(issueId: string, providerId: string): Promise<ProviderIssueResponseDTO>;
}

