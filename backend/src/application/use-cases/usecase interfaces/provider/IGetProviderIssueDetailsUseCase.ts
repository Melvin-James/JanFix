import type { ProviderIssueResponseDTO } from "../../../dto/provider/ProviderIssueResponseDTO.ts";

export interface IGetProviderIssueDetailsUseCase {
    execute(issueId: string, providerId: string): Promise<ProviderIssueResponseDTO>;
}

