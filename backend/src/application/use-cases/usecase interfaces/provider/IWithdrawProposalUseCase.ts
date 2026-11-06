export interface IWithdrawProposalUseCase {
    execute(issueId: string, providerId: string, serverNow?: Date): Promise<{ success: boolean; message: string }>;
}

