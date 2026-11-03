export interface ExpressIssueInterestResult {
    success: boolean;
    message: string;
}

export interface IExpressIssueInterestUseCase {
    execute(issueId: string, providerId: string): Promise<ExpressIssueInterestResult>;
}
